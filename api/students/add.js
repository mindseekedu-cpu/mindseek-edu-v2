// api/students/add.js
// Menambah siswa baru (hanya untuk orang tua yang sudah login)

import { supabase } from '../../lib/supabase-client.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];

    // Verifikasi token dan ambil user (orang tua)
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth user error:', userError?.message);
      return res.status(401).json({ error: 'Token tidak valid atau kadaluarsa' });
    }

    const parentId = user.id;

    // Validasi input dari body
    const { name, email, school, curriculum, grade, pin } = req.body;

    if (!name || !grade) {
      return res.status(400).json({ error: 'Nama siswa dan grade wajib diisi' });
    }

    // Validasi grade (1-6)
    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 6) {
      return res.status(400).json({ error: 'Grade harus antara 1 dan 6' });
    }

    // Validasi kurikulum (jika disediakan)
    const allowedCurriculums = ['Nasional', 'Nasional_Plus', 'Internasional'];
    if (curriculum && !allowedCurriculums.includes(curriculum)) {
      return res.status(400).json({ error: 'Kurikulum tidak valid' });
    }

    // Siapkan data siswa
    const studentData = {
      parent_id: parentId,
      name: name,
      email: email || null,
      school: school || null,
      curriculum: curriculum || 'Nasional',
      grade: gradeNum,
      pin: pin || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert ke tabel students_profile
    const { data: newStudent, error: insertError } = await supabase
      .from('students_profile')
      .insert(studentData)
      .select()
      .single();

    if (insertError) {
      console.error('Insert student error:', insertError.message);
      return res.status(500).json({ error: 'Gagal menambah siswa' });
    }

    return res.status(201).json({
      success: true,
      message: 'Siswa berhasil ditambahkan',
      student: newStudent
    });
  } catch (error) {
    console.error('Add student error:', error.message);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
