// api/ocr.js
// Vercel Serverless Function untuk OCR menggunakan OCR.space API
// Menerima upload file (gambar/PDF) dan mengembalikan teks hasil scan

import Busboy from 'busboy';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method tidak diizinkan. Gunakan POST.'
    });
  }

  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) {
    console.error('OCR Error: OCR_SPACE_API_KEY tidak ditemukan');
    return res.status(500).json({
      success: false,
      error: 'Server tidak terkonfigurasi dengan benar.'
    });
  }

  let fileBuffer = null;
  let fileInfo = null;
  let fileFound = false;

  const busboy = Busboy({ headers: req.headers });
  const parsePromise = new Promise((resolve, reject) => {
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      if (fieldname !== 'file') {
        file.resume();
        return;
      }
      fileFound = true;
      fileInfo = { filename, mimetype };
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
        resolve();
      });
      file.on('error', (err) => reject(err));
    });

    busboy.on('finish', () => {
      if (!fileFound) {
        reject(new Error('Tidak ada file yang diunggah.'));
      } else {
        resolve();
      }
    });
    busboy.on('error', (err) => reject(err));
  });

  req.pipe(busboy);

  try {
    await parsePromise;

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ success: false, error: 'File kosong.' });
    }

    const maxSize = 5 * 1024 * 1024;
    if (fileBuffer.length > maxSize) {
      return res.status(413).json({ success: false, error: 'Ukuran file maksimal 5 MB.' });
    }

    // --- PERBAIKAN UTAMA DI SINI ---
    // 1. Tentukan 'filetype' dengan lebih baik
    let filetype = 'Auto';
    if (fileInfo && fileInfo.mimetype && fileInfo.mimetype.includes('pdf')) {
      filetype = 'PDF';
    } else if (fileInfo && fileInfo.filename && fileInfo.filename.toLowerCase().includes('.pdf')) {
      filetype = 'PDF';
    }

    // 2. Kirimkan parameter 'language' dengan nilai 'auto'
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: fileInfo?.mimetype || 'application/octet-stream' });
    formData.append('file', blob, fileInfo?.filename || 'upload.jpg');
    formData.append('apikey', apiKey);
    formData.append('language', 'auto'); // <-- PERUBAHAN: 'auto' bukan 'ind'
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', filetype);
    // --- AKHIR PERBAIKAN ---

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.IsErroredOnProcessing || !data.ParsedResults || data.ParsedResults.length === 0) {
      console.error('OCR.space error:', data.ErrorMessage || 'Unknown error');
      return res.status(422).json({
        success: false,
        error: 'Gagal membaca teks. Pastikan gambar jelas.'
      });
    }

    const extractedText = data.ParsedResults[0].ParsedText || '';
    if (!extractedText.trim()) {
      return res.status(422).json({
        success: false,
        error: 'Tidak ada teks terdeteksi.'
      });
    }

    return res.status(200).json({ success: true, text: extractedText });

  } catch (err) {
    console.error('OCR handler error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Maaf, gagal memproses file. Coba lagi.'
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
