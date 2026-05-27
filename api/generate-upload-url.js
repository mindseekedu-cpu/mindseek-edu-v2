// api/generate-upload-url.js
// Vercel Serverless Function untuk generate signed upload URL ke Supabase Storage

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

    // Buat path unik untuk file
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filePath = `uploads/${timestamp}_${random}_${fileName}`;

    // Generate signed upload URL (expires in 5 minutes)
    const { data, error } = await supabase.storage
      .from('ocr-uploads')
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error('Supabase signed URL error:', error);
      throw new Error('Gagal membuat signed URL');
    }

    // Dapatkan public URL untuk akses setelah upload
    const { data: publicUrlData } = supabase.storage
      .from('ocr-uploads')
      .getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

    return res.status(200).json({
      success: true,
      signedUrl: data.signedUrl,
      filePath: filePath,
      publicUrl: publicUrl
    });
  } catch (error) {
    console.error('Generate upload URL error:', error.message);
    return res.status(500).json({ error: 'Gagal menyiapkan upload' });
  }
}
