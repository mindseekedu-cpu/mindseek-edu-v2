// api/auth/me.js
// Mengambil data user yang sedang login (orang tua) beserta daftar siswa
// Memerlukan token JWT di header Authorization: Bearer <token>

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

    // Verifikasi token dan ambil user dari Supabase Auth
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth user error:', userError?.message);
      return res.status(401).json({ error: 'Token tidak valid atau kadaluarsa' });
    }

    // Ambil data orang tua dari tabel users_parent
    const { data: parentData, error: parentError } = await supabase
      .from('users_parent')
      .select('*')
      .eq('id', user.id)
      .single();

    if (parentError && parentError.code !== 'PGRST116') {
      console.error('Fetch parent error:', parentError.message);
      return res.status(500).json({ error: 'Gagal mengambil data pengguna' });
    }

    // Ambil daftar siswa dari tabel students_profile
    const { data: students, error: studentsError } = await supabase
      .from('students_profile')
      .select('*')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: true });

    if (studentsError) {
      console.error('Fetch students error:', studentsError.message);
      // Tidak perlu throw, bisa return students kosong
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: parentData?.name || user.user_metadata?.name || 'Pengguna',
        created_at: parentData?.created_at || user.created_at
      },
      students: students || []
    });
  } catch (error) {
    console.error('Me endpoint error:', error.message);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
