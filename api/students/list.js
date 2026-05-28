// api/students/list.js
// Mengambil daftar siswa milik orang tua yang sedang login

import { supabase } from '../../lib/supabase-client.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];

    // Verifikasi token dan ambil user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    // Ambil daftar siswa berdasarkan parent_id
    const { data: students, error: studentsError } = await supabase
      .from('students_profile')
      .select('*')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: true });

    if (studentsError) {
      console.error('Fetch students error:', studentsError.message);
      return res.status(500).json({ error: 'Gagal mengambil data siswa' });
    }

    return res.status(200).json({
      success: true,
      students: students || []
    });
  } catch (error) {
    console.error('List students error:', error.message);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
