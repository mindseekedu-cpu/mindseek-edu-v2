// api/ocr.js (final dengan Supabase Storage + OCR.space OCREngine=2)
import { supabase } from '../lib/supabase-client.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileUrl } = req.body;
    if (!fileUrl) {
      return res.status(400). json({ error: 'fileUrl wajib diisi' });
    }

    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) {
      console.error('OCR Error: OCR_SPACE_API_KEY missing');
      return res.status(500).json({ error: 'Server tidak terkonfigurasi' });
    }

    // Download file dari Supabase Storage
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Gagal download file dari Storage: ${fileResponse.status}`);
    }
    const fileBuffer = await fileResponse.arrayBuffer();
    const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';
    
    // Tentukan filetype untuk OCR.space
    const isPdf = contentType.includes('pdf') || fileUrl.toLowerCase().includes('.pdf');
    const fileTypeParam = isPdf ? 'PDF' : 'Auto';

    // Kirim ke OCR.space dengan OCREngine=2 (lebih akurat)
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: contentType });
    formData.append('file', blob, 'upload');
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

    // (Opsional) hapus file dari Storage setelah selesai
    const filePath = new URL(fileUrl).pathname.split('/').slice(3).join('/');
    await supabase.storage.from('ocr-uploads').remove([filePath]).catch(console.error);

    return res.status(200).json({ success: true, text: extractedText });
  } catch (error) {
    console.error('OCR handler error:', error.message);
    return res.status(500).json({ error: 'Maaf, gagal memproses file' });
  }
}
