// api/save-chat.js
// Vercel Serverless Function untuk menyimpan ringkasan akhir sesi belajar
// Menyimpan ke tabel sessions dan (opsional) mengakumulasi ke topics_progress
// Menggunakan student_id (bukan user_id)

import { supabase } from '../lib/supabase-client.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan. Gunakan POST.' });
  }

  try {
    const {
      sessionId,
      studentId,
      sessionType,
      grade,
      topic,
      subject,
      totalQuestions,
      completedCount,
      independentCount,
      aiAssistedCount,
      skippedCount,
      needGuidanceCount,
      easyCount,
      mediumCount,
      hardCount
    } = req.body;

    // Validasi input wajib (studentId ditambahkan)
    if (!sessionId || !studentId || !sessionType || !grade || !topic) {
      return res.status(400).json({ 
        error: 'sessionId, studentId, sessionType, grade, dan topic wajib diisi.' 
      });
    }

    // Validasi sessionType
    const allowedTypes = ['pr', 'practice', 'exam'];
    if (!allowedTypes.includes(sessionType)) {
      return res.status(400).json({ 
        error: 'sessionType tidak valid. Gunakan: pr, practice, atau exam.' 
      });
    }

    // Siapkan data untuk tabel sessions (pakai student_id)
    const sessionData = {
      session_id: sessionId,
      student_id: studentId,
      session_type: sessionType,
      grade: grade,
      topic: topic,
      subject: subject || null,
      total_questions: totalQuestions || 0,
      completed_count: completedCount || 0,
      independent_count: independentCount || 0,
      ai_assisted_count: aiAssistedCount || 0,
      skipped_count: skippedCount || 0,
      need_guidance_count: needGuidanceCount || 0,
      easy_count: easyCount || 0,
      medium_count: mediumCount || 0,
      hard_count: hardCount || 0,
      timestamp: new Date().toISOString()
    };

    // Insert ke tabel sessions
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert(sessionData);

    if (sessionError) {
      console.error('Gagal insert sessions:', sessionError.message);
      throw new Error('Gagal menyimpan ringkasan sesi.');
    }

    // === Jika mode practice atau exam, update topics_progress ===
    if (sessionType === 'practice' || sessionType === 'exam') {
      // Ambil data existing topics_progress berdasarkan student_id, grade, topic
      const { data: existing, error: fetchError } = await supabase
        .from('topics_progress')
        .select('total_questions, independent_count, easy_count, medium_count, hard_count')
        .eq('student_id', studentId)
        .eq('grade', grade)
        .eq('topic', topic)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Gagal fetch topics_progress:', fetchError.message);
      }

      // Hitung nilai akumulasi
      const newTotal = (existing?.total_questions || 0) + (completedCount || 0);
      const newIndependent = (existing?.independent_count || 0) + (independentCount || 0);
      const newEasy = (existing?.easy_count || 0) + (easyCount || 0);
      const newMedium = (existing?.medium_count || 0) + (mediumCount || 0);
      const newHard = (existing?.hard_count || 0) + (hardCount || 0);

      // Upsert dengan student_id
      const { error: upsertError } = await supabase
        .from('topics_progress')
        .upsert({
          student_id: studentId,
          grade: grade,
          topic: topic,
          subject: subject || null,
          total_questions: newTotal,
          independent_count: newIndependent,
          easy_count: newEasy,
          medium_count: newMedium,
          hard_count: newHard,
          last_practiced: new Date().toISOString()
        }, {
          onConflict: 'student_id, grade, topic'
        });

      if (upsertError) {
        console.error('Gagal upsert topics_progress:', upsertError.message);
        // Tidak throw error agar response tetap sukses untuk sessions
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Sesi berhasil disimpan.' 
    });

  } catch (error) {
    console.error('Save chat handler error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Gagal menyimpan sesi. Silakan coba lagi.' 
    });
  }
}
