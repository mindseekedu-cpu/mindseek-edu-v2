// api/auth/login.js
// Login orang tua dengan email dan password
// Mengembalikan session, data orang tua, dan daftar siswa

import { supabase } from '../../lib/supabase-client.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    // Login ke Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Login error:', authError.message);
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const userId = authData.user.id;

    // Ambil data orang tua dari users_parent
    const { data: parentData, error: parentError } = await supabase
      .from('users_parent')
      .select('id, name, email, created_at')
      .eq('id', userId)
      .single();

    if (parentError) {
      console.error('Fetch parent error:', parentError.message);
      return res.status(500).json({ error: 'Gagal mengambil data orang tua' });
    }

    // Ambil daftar siswa milik orang tua ini
    const { data: studentsData, error: studentsError } = await supabase
      .from('students_profile')
      .select('id, name, email, school, curriculum, grade, pin, created_at')
      .eq('parent_id', userId)
      .order('name', { ascending: true });

    if (studentsError) {
      console.error('Fetch students error:', studentsError.message);
      return res.status(500).json({ error: 'Gagal mengambil data siswa' });
    }

    return res.status(200).json({
      success: true,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at
      },
      user: {
        id: userId,
        name: parentData.name,
        email: parentData.email,
        created_at: parentData.created_at
      },
      students: studentsData || []
    });
  } catch (error) {
    console.error('Login handler error:', error.message);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
