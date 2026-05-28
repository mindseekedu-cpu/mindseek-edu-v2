// api/exam-unlock.js
// Vercel Serverless Function untuk mengecek kelayakan ujian (Exam mode)
// Syarat: semua topik dalam satu mata pelajaran di grade tertentu memiliki kemandirian ≥80%
// Menggunakan student_id (bukan user_id)

import { supabase } from '../lib/supabase-client.js';
import { curriculum } from '../lib/curriculum.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method tidak diizinkan. Gunakan GET.' });
  }

  try {
    const { studentId, grade, subject = 'Matematika' } = req.query;

    // Validasi input
    if (!studentId || !grade) {
      return res.status(400).json({ 
        error: 'Parameter studentId dan grade wajib diisi.' 
      });
    }

    // Validasi grade (1-6)
    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 6) {
      return res.status(400).json({ error: 'Grade harus antara 1 dan 6.' });
    }

    // Ambil daftar topik dari curriculum berdasarkan grade dan subject
    const gradeData = curriculum[grade];
    if (!gradeData) {
      return res.status(404).json({ error: `Grade ${grade} tidak ditemukan dalam kurikulum.` });
    }

    const topicList = gradeData[subject];
    if (!topicList || !Array.isArray(topicList) || topicList.length === 0) {
      return res.status(404).json({ 
        error: `Mata pelajaran ${subject} untuk grade ${grade} tidak ditemukan.` 
      });
    }

    // Query topics_progress untuk student ini pada grade dan topik-topik yang relevan
    const { data: progressData, error } = await supabase
      .from('topics_progress')
      .select('topic, total_questions, independent_count')
      .eq('student_id', studentId)
      .eq('grade', grade);

    if (error) {
      console.error('Query topics_progress error:', error.message);
      throw new Error('Gagal membaca data progress.');
    }

    // Buat map progress per topik
    const progressMap = new Map();
    progressData?.forEach(item => {
      progressMap.set(item.topic, {
        total_questions: item.total_questions || 0,
        independent_count: item.independent_count || 0
      });
    });

    // Hitung status tuntas untuk setiap topik
    const MIN_MASTERY_PERCENT = 0.8; // 80%
    const MIN_QUESTIONS_REQUIRED = 5; // Minimal 5 soal untuk bisa dinilai tuntas

    let completedTopics = [];
    let incompleteTopics = [];

    for (const topic of topicList) {
      const progress = progressMap.get(topic);
      let total = progress?.total_questions || 0;
      let independent = progress?.independent_count || 0;
      
      let mastery = 0;
      if (total > 0) {
        mastery = independent / total;
      }
      
      const isCompleted = (total >= MIN_QUESTIONS_REQUIRED && mastery >= MIN_MASTERY_PERCENT);
      
      if (isCompleted) {
        completedTopics.push(topic);
      } else {
        incompleteTopics.push(topic);
      }
    }

    const totalTopics = topicList.length;
    const completedCount = completedTopics.length;
    const unlocked = (completedCount === totalTopics);

    let message = '';
    if (unlocked) {
      message = `Selamat! Kamu sudah menguasai semua topik ${subject} kelas ${grade} dengan baik. Kamu layak mengikuti ujian! 💪`;
    } else {
      const remaining = incompleteTopics.length;
      message = `Kamu masih harus menyelesaikan ${remaining} topik lagi untuk bisa mengikuti ujian ${subject} kelas ${grade}. Topik yang perlu ditingkatkan: ${incompleteTopics.join(', ')}. Terus berlatih! 🌟`;
    }

    return res.status(200).json({
      unlocked,
      totalTopics,
      completedTopics: completedCount,
      incompleteTopics,
      message
    });

  } catch (error) {
    console.error('Exam unlock error:', error.message);
    return res.status(500).json({
      error: 'Maaf, terjadi gangguan saat mengecek kelayakan ujian. Coba lagi nanti.'
    });
  }
}
