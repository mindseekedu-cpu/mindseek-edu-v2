// api/ocr.js (final dengan ekstensi file yang benar)
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

    // Tentukan ekstensi file berdasarkan content-type atau nama file
    let fileExtension = '';
    let fileTypeParam = 'Auto';

    if (contentType.includes('pdf') || filePath.toLowerCase().includes('.pdf')) {
      fileExtension = '.pdf';
      fileTypeParam = 'PDF';
    } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      fileExtension = '.jpg';
      fileTypeParam = 'Auto';
    } else if (contentType.includes('png')) {
      fileExtension = '.png';
      fileTypeParam = 'Auto';
    } else {
      // Fallback: cek dari ekstensi filePath
      const lastDot = filePath.lastIndexOf('.');
      if (lastDot !== -1) {
        fileExtension = filePath.substring(lastDot);
        if (fileExtension.toLowerCase() === '.pdf') fileTypeParam = 'PDF';
      } else {
        fileExtension = '.jpg'; // default
      }
    }

    // Nama file dengan ekstensi yang benar
    const fileName = `upload${fileExtension}`;

    // Kirim ke OCR.space dengan OCREngine=2
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
    if (ocrData.IsErroredOnProcessing || !ocrData.ParsedResults?.length) {
      console.error('OCR.space error:', ocrData.ErrorMessage);
      return res.status(422).json({ error: 'Gagal membaca teks dari file' });
    }

    const extractedText = ocrData.ParsedResults[0].ParsedText || '';
    if (!extractedText.trim()) {
      return res.status(422).json({ error: 'Tidak ada teks terdeteksi' });
    }

    // Hapus file dari storage setelah sukses (opsional)
    await supabase.storage.from('ocr-uploads').remove([filePath]).catch(console.error);

    return res.status(200).json({ success: true, text: extractedText });
  } catch (error) {
    console.error('OCR handler error:', error.message);
    return res.status(500).json({ error: 'Maaf, gagal memproses file' });
  }
}
