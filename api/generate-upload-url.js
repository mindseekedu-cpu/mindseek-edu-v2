// api/generate-upload-url.js
import { supabase } from '../lib/supabase-client.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, fileType } = req.body;
    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName dan fileType wajib diisi' });
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filePath = `uploads/${timestamp}_${random}_${fileName}`;

    const { data, error } = await supabase.storage
      .from('ocr-uploads')
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error('Supabase signed URL error:', error);
      throw new Error('Gagal membuat signed URL');
    }

    return res.status(200).json({
      success: true,
      signedUrl: data.signedUrl,
      filePath: filePath
    });
  } catch (error) {
    console.error('Generate upload URL error:', error.message);
    return res.status(500).json({ error: 'Gagal menyiapkan upload' });
  }
}
