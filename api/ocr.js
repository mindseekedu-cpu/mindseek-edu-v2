// api/ocr.js
// Vercel Serverless Function untuk OCR menggunakan OCR.space API
// Menerima upload file (gambar/PDF) dan mengembalikan teks hasil scan

import Busboy from 'busboy';

export default async function handler(req, res) {
  // Hanya menerima method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method tidak diizinkan. Gunakan POST.' 
    });
  }

  // Cek apakah OCR_SPACE_API_KEY tersedia
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) {
    console.error('OCR Error: OCR_SPACE_API_KEY tidak ditemukan di environment variables');
    return res.status(500).json({ 
      success: false, 
      error: 'Server tidak terkonfigurasi dengan benar. Hubungi administrator.' 
    });
  }

  // Parsing multipart form data menggunakan busboy
  let fileBuffer = null;
  let fileInfo = null;
  let fileFound = false;

  const busboy = Busboy({ headers: req.headers });

  // Promise untuk menunggu proses parsing selesai
  const parsePromise = new Promise((resolve, reject) => {
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      if (fieldname !== 'file') {
        file.resume(); // buang field lain
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
        reject(new Error('Tidak ada file yang diunggah. Gunakan field name "file".'));
      }
      resolve();
    });

    busboy.on('error', (err) => reject(err));
  });

  // Pipe request ke busboy
  req.pipe(busboy);

  try {
    await parsePromise;

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'File kosong atau tidak valid.' 
      });
    }

    // Batasi ukuran file (misal 5MB)
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (fileBuffer.length > maxSize) {
      return res.status(413).json({ 
        success: false, 
        error: 'Ukuran file terlalu besar. Maksimal 5 MB.' 
      });
    }

    // Kirim ke OCR.space API
    const formData = new FormData();
    // OCR.space menerima file sebagai blob atau base64. Kita kirim sebagai Blob.
    const blob = new Blob([fileBuffer], { type: fileInfo?.mimetype || 'application/octet-stream' });
    formData.append('file', blob, fileInfo?.filename || 'upload');
    formData.append('apikey', apiKey);
    formData.append('language', 'ind'); // Bahasa Indonesia
    formData.append('isOverlayRequired', 'false');
    // Perbaikan: cek mimetype dengan aman
    const isPdf = fileInfo && fileInfo.mimetype && fileInfo.mimetype.includes('pdf');
    formData.append('filetype', isPdf ? 'PDF' : 'Auto');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    // Cek apakah OCR berhasil
    if (data.IsErroredOnProcessing || !data.ParsedResults || data.ParsedResults.length === 0) {
      console.error('OCR.space error:', data.ErrorMessage || 'Unknown error');
      return res.status(422).json({
        success: false,
        error: 'Gagal membaca teks dari gambar. Pastikan gambar jelas dan terbaca.',
      });
    }

    const extractedText = data.ParsedResults[0].ParsedText || '';
    
    if (!extractedText.trim()) {
      return res.status(422).json({
        success: false,
        error: 'Tidak ada teks yang terdeteksi. Coba gunakan gambar yang lebih jelas.',
      });
    }

    // Berhasil
    return res.status(200).json({
      success: true,
      text: extractedText,
    });

  } catch (err) {
    console.error('OCR handler error:', err.message);
    // Pesan error ramah untuk pengguna
    return res.status(500).json({
      success: false,
      error: 'Maaf, gagal memproses file. Coba lagi nanti atau gunakan gambar lain.',
    });
  }
}

// Konfigurasi untuk Vercel (opsional, batasi body size)
export const config = {
  api: {
    bodyParser: false, // Matikan body parser default karena kita pakai busboy
  },
};
