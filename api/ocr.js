// api/ocr.js
import Busboy from 'busboy';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method tidak diizinkan.' });
  }

  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) {
    console.error('OCR Error: OCR_SPACE_API_KEY tidak ditemukan');
    return res.status(500).json({ success: false, error: 'Server tidak terkonfigurasi.' });
  }

  let fileBuffer = null;
  let fileMimetype = null;
  let fileFound = false;
  let fileFilename = null;

  const busboy = Busboy({ headers: req.headers });
  const parsePromise = new Promise((resolve, reject) => {
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      if (fieldname !== 'file') {
        file.resume();
        return;
      }
      fileFound = true;
      fileMimetype = mimetype;
      fileFilename = filename;
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
        resolve();
      });
      file.on('error', (err) => reject(err));
    });
    busboy.on('finish', () => {
      if (!fileFound) reject(new Error('Tidak ada file.'));
      else resolve();
    });
    busboy.on('error', (err) => reject(err));
  });

  req.pipe(busboy);

  try {
    await parsePromise;
    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ success: false, error: 'File kosong.' });
    }
    if (fileBuffer.length > 5 * 1024 * 1024) {
      return res.status(413).json({ success: false, error: 'Maksimal 5 MB.' });
    }

    // Tentukan filetype berdasarkan mimetype (paling aman)
    let filetype = 'Auto';
    if (fileMimetype && fileMimetype.includes('pdf')) {
      filetype = 'PDF';
    } else if (fileFilename && typeof fileFilename === 'string' && fileFilename.toLowerCase().endsWith('.pdf')) {
      // Fallback jika mimetype tidak ada
      filetype = 'PDF';
    }

    // Siapkan FormData
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: fileMimetype || 'application/octet-stream' });
    // Nama file aman: jika filename string gunakan, jika tidak beri default
    const safeFilename = (fileFilename && typeof fileFilename === 'string') ? fileFilename : 'upload.jpg';
    formData.append('file', blob, safeFilename);
    formData.append('apikey', apiKey);
    formData.append('language', 'auto');
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', filetype);

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();

    if (data.IsErroredOnProcessing || !data.ParsedResults || data.ParsedResults.length === 0) {
      console.error('OCR.space error:', data.ErrorMessage);
      return res.status(422).json({ success: false, error: 'Gagal membaca teks. Pastikan gambar jelas.' });
    }
    const extractedText = data.ParsedResults[0].ParsedText || '';
    if (!extractedText.trim()) {
      return res.status(422).json({ success: false, error: 'Tidak ada teks terdeteksi.' });
    }
    return res.status(200).json({ success: true, text: extractedText });
  } catch (err) {
    console.error('OCR handler error:', err.message);
    return res.status(500).json({ success: false, error: 'Maaf, gagal memproses file. Coba lagi.' });
  }
}

export const config = { api: { bodyParser: false } };
