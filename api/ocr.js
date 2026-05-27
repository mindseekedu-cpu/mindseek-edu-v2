// api/ocr.js (final dengan logging dan fallback)
import { supabase } from '../lib/supabase-client.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: 'filePath wajib diisi' });
    }

    console.log('Processing filePath:', filePath);

    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) {
      console.error('OCR Error: OCR_SPACE_API_KEY missing');
      return res.status(500).json({ error: 'Server tidak terkonfigurasi' });
    }

    // Download file dari Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('ocr-uploads')
      .download(filePath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error('Gagal mengunduh file dari storage');
    }

    const fileBuffer = Buffer.from(await fileData.arrayBuffer());
    const contentType = fileData.type || 'application/octet-stream';
    console.log('File size:', fileBuffer.length, 'Content-Type:', contentType);

    // Cek ukuran (OCR.space gratis maksimal 5MB, tapi lebih aman 4MB)
    if (fileBuffer.length > 4 * 1024 * 1024) {
      return res.status(413).json({ error: 'Ukuran file terlalu besar (maksimal 4MB untuk OCR.space gratis)' });
    }

    // Tentukan ekstensi file dan filetype
    let fileExtension = '';
    let fileTypeParam = 'Auto';

    if (contentType.includes('pdf') || filePath.toLowerCase().includes('.pdf')) {
      fileExtension = '.pdf';
      fileTypeParam = 'PDF';
    } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      fileExtension = '.jpg';
    } else if (contentType.includes('png')) {
      fileExtension = '.png';
    } else if (contentType.includes('heic') || contentType.includes('heif')) {
      // HP iPhone sering kirim HEIC, ganti ke jpg
      fileExtension = '.jpg';
      console.log('HEIC detected, treated as jpg');
    } else {
      // Coba ekstrak dari filePath
      const lastDot = filePath.lastIndexOf('.');
      if (lastDot !== -1) {
        fileExtension = filePath.substring(lastDot);
        if (fileExtension.toLowerCase() === '.pdf') fileTypeParam = 'PDF';
      } else {
        fileExtension = '.jpg'; // default
      }
    }

    const fileName = `upload${fileExtension}`;
    console.log('Sending to OCR.space with filename:', fileName, 'filetype:', fileTypeParam);

    // Kirim ke OCR.space
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: contentType });
    formData.append('file', blob, fileName);
    formData.append('apikey', apiKey);
    formData.append('language', 'eng');
    formData.append('OCREngine', '2');
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', fileTypeParam);

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    const ocrData = await ocrResponse.json();
    console.log('OCR.space response status:', ocrResponse.status);
    console.log('OCR.space response body:', JSON.stringify(ocrData).substring(0, 500));

    if (!ocrResponse.ok || ocrData.IsErroredOnProcessing) {
      const errorMsg = ocrData.ErrorMessage || ocrData.Errors?.join(', ') || 'Unknown OCR error';
      console.error('OCR.space error:', errorMsg);
      return res.status(422).json({ error: `Gagal membaca teks: ${errorMsg}` });
    }

    if (!ocrData.ParsedResults || !ocrData.ParsedResults.length) {
      console.error('No parsed results', ocrData);
      return res.status(422).json({ error: 'OCR tidak menghasilkan teks' });
    }

    const extractedText = ocrData.ParsedResults[0].ParsedText || '';
    if (!extractedText.trim()) {
      return res.status(422).json({ error: 'Tidak ada teks terdeteksi' });
    }

    // Hapus file dari storage setelah sukses (opsional)
    await supabase.storage.from('ocr-uploads').remove([filePath]).catch(console.error);

    return res.status(200).json({ success: true, text: extractedText });
  } catch (error) {
    console.error('OCR handler error:', error.message, error.stack);
    return res.status(500).json({ error: 'Maaf, gagal memproses file. Coba lagi.' });
  }
}
