// api/learning-summary.js
// Vercel Serverless Function untuk laporan perkembangan siswa (orang tua)
// Menampilkan progress per topik, statistik keseluruhan, soal butuh dampingan, riwayat sesi
// Menggunakan student_id (bukan user_id)

import { supabase } from '../lib/supabase-client.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method tidak diizinkan. Gunakan GET.' });
  }

  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ error: 'Parameter studentId wajib diisi.' });
    }

    // Parallel queries dengan student_id
    const [topicsResult, guidanceResult, sessionsResult] = await Promise.all([
      supabase
        .from('topics_progress')
        .select('*')
        .eq('student_id', studentId)
        .order('grade', { ascending: true })
        .order('topic', { ascending: true }),
      
      supabase
        .from('guidance_questions')
        .select('*')
        .eq('student_id', studentId)
        .eq('resolved', false)
        .order('created_at', { ascending: false }),
      
      supabase
        .from('sessions')
        .select('*')
        .eq('student_id', studentId)
        .order('timestamp', { ascending: false })
        .limit(10)
    ]);

    if (topicsResult.error) {
      console.error('Topics progress error:', topicsResult.error.message);
      throw new Error('Gagal mengambil data progress.');
    }
    if (guidanceResult.error) {
      console.error('Guidance questions error:', guidanceResult.error.message);
      throw new Error('Gagal mengambil data pendampingan.');
    }
    if (sessionsResult.error) {
      console.error('Sessions error:', sessionsResult.error.message);
      throw new Error('Gagal mengambil riwayat sesi.');
    }

    const topicsProgress = topicsResult.data || [];
    const pendingGuidance = guidanceResult.data || [];
    const recentSessions = sessionsResult.data || [];

    // Hitung statistik agregat dari topics_progress
    let totalQuestions = 0;
    let totalIndependent = 0;
    let totalTopicsMastered = 0;
    let topicsWithDetails = [];

    for (const topic of topicsProgress) {
      const total = topic.total_questions || 0;
      const independent = topic.independent_count || 0;
      const percent = total > 0 ? independent / total : 0;
      const mastered = (total >= 5 && percent >= 0.8);
      
      totalQuestions += total;
      totalIndependent += independent;
      if (mastered) totalTopicsMastered++;
      
      topicsWithDetails.push({
        topic: topic.topic,
        grade: topic.grade,
        subject: topic.subject,
        totalQuestions: total,
        independentPercent: Math.round(percent * 100) / 100,
        status: mastered ? 'mastered' : (total === 0 ? 'not_started' : 'in_progress')
      });
    }

    const averageIndependence = totalQuestions > 0 ? totalIndependent / totalQuestions : 0;
    const totalTopicsPracticed = topicsProgress.length;

    const response = {
      studentId: studentId,
      summary: {
        totalQuestions: totalQuestions,
        averageIndependence: Math.round(averageIndependence * 100) / 100,
        totalTopicsMastered: totalTopicsMastered,
        totalTopicsPracticed: totalTopicsPracticed
      },
      topicsProgress: topicsWithDetails,
      pendingGuidance: pendingGuidance.map(g => ({
        id: g.id,
        questionText: g.question_text,
        topic: g.topic,
        difficulty: g.difficulty,
        mode: g.mode,
        createdAt: g.created_at,
        status: g.status
      })),
      recentSessions: recentSessions.map(s => ({
        sessionId: s.session_id,
        sessionType: s.session_type,
        grade: s.grade,
        topic: s.topic,
        subject: s.subject,
        totalQuestions: s.total_questions,
        independentCount: s.independent_count,
        aiAssistedCount: s.ai_assisted_count,
        skippedCount: s.skipped_count,
        needGuidanceCount: s.need_guidance_count,
        timestamp: s.timestamp
      }))
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Learning summary error:', error.message);
    return res.status(500).json({
      error: 'Maaf, terjadi gangguan saat mengambil data laporan. Coba lagi nanti.'
    });
  }
}
