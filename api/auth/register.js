// api/auth/register.js
// Registrasi orang tua baru (email, password, nama)
// Menggunakan Supabase Auth dan menyimpan data ke tabel users_parent

import { supabase } from '../../lib/supabase-client.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, dan nama wajib diisi' });
    }

    // 1. Daftar ke Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'parent' }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError.message);
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(500).json({ error: 'Gagal membuat akun auth' });
    }

    // 2. Simpan ke tabel users_parent (manual, karena trigger belum tentu ada)
    const { error: insertError } = await supabase
      .from('users_parent')
      .insert({
        id: authData.user.id,
        name: name,
        email: email,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Insert users_parent error:', insertError.message);
      // Jika gagal insert, hapus user auth untuk konsistensi (opsional)
      await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {});
      return res.status(500).json({ error: 'Gagal menyimpan data orang tua' });
    }

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil. Silakan login.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: name
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
