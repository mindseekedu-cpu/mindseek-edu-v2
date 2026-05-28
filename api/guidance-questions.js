// api/guidance-questions.js
// Vercel Serverless Function untuk CRUD soal yang perlu didampingi orang tua
// Tabel: guidance_questions
// Menggunakan student_id (bukan user_id)

import { supabase } from '../lib/supabase-client.js';

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      return handlePost(req, res);
    case 'GET':
      return handleGet(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      return res.status(405).json({ error: 'Method tidak diizinkan. Gunakan POST, GET, PUT, atau DELETE.' });
  }
}

// POST: menyimpan soal baru yang butuh dampingan
async function handlePost(req, res) {
  try {
    const {
      studentId,
      questionText,
      topic,
      difficulty,
      answerKey,
      teachingSteps,
      mode
    } = req.body;

    // Validasi wajib (studentId menggantikan userId)
    if (!studentId || !questionText || !topic || !difficulty || !mode) {
      return res.status(400).json({
        error: 'studentId, questionText, topic, difficulty, dan mode wajib diisi.'
      });
    }

    // Validasi difficulty
    const allowedDifficulties = ['easy', 'medium', 'hard'];
    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({ error: 'difficulty harus easy, medium, atau hard.' });
    }

    // Validasi mode
    const allowedModes = ['pr', 'practice', 'exam'];
    if (!allowedModes.includes(mode)) {
      return res.status(400).json({ error: 'mode harus pr, practice, atau exam.' });
    }

    const newQuestion = {
      student_id: studentId,
      question_text: questionText,
      topic: topic,
      difficulty: difficulty,
      answer_key: answerKey || null,
      teaching_steps: teachingSteps || null,
      mode: mode,
      status: 'pending',
      resolved: false,
      created_at: new Date().toISOString(),
      updated_at: null
    };

    const { data, error } = await supabase
      .from('guidance_questions')
      .insert(newQuestion)
      .select()
      .single();

    if (error) {
      console.error('Insert guidance question error:', error.message);
      throw new Error('Gagal menyimpan soal.');
    }

    return res.status(201).json({
      success: true,
      message: 'Soal pendampingan berhasil disimpan.',
      data: data
    });

  } catch (error) {
    console.error('POST /guidance-questions error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Maaf, terjadi gangguan saat menyimpan soal.'
    });
  }
}

// GET: mengambil daftar soal untuk orang tua (filter studentId, status, resolved)
async function handleGet(req, res) {
  try {
    const { studentId, status, resolved } = req.query;

    if (!studentId) {
      return res.status(400).json({ error: 'Parameter studentId wajib diisi.' });
    }

    let query = supabase
      .from('guidance_questions')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (resolved !== undefined) {
      const isResolved = resolved === 'true';
      query = query.eq('resolved', isResolved);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get guidance questions error:', error.message);
      throw new Error('Gagal mengambil data soal.');
    }

    return res.status(200).json(data || []);

  } catch (error) {
    console.error('GET /guidance-questions error:', error.message);
    return res.status(500).json({
      error: 'Maaf, terjadi gangguan saat mengambil data.'
    });
  }
}

// PUT: update status/resolved dari soal
async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const { status, resolved, answerKey, teachingSteps } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Parameter id wajib diisi.' });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (resolved !== undefined) updateData.resolved = resolved;
    if (answerKey !== undefined) updateData.answer_key = answerKey;
    if (teachingSteps !== undefined) updateData.teaching_steps = teachingSteps;
    updateData.updated_at = new Date().toISOString();

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Tidak ada field yang akan diupdate.' });
    }

    const { data, error } = await supabase
      .from('guidance_questions')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('Update guidance question error:', error.message);
      throw new Error('Gagal memperbarui soal.');
    }

    if (!data) {
      return res.status(404).json({ error: 'Soal dengan id tersebut tidak ditemukan.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Soal berhasil diperbarui.',
      data: data
    });

  } catch (error) {
    console.error('PUT /guidance-questions error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Maaf, terjadi gangguan saat memperbarui soal.'
    });
  }
}

// DELETE: menghapus soal (untuk debugging)
async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Parameter id wajib diisi.' });
    }

    const { data, error } = await supabase
      .from('guidance_questions')
      .delete()
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('Delete guidance question error:', error.message);
      throw new Error('Gagal menghapus soal.');
    }

    if (!data) {
      return res.status(404).json({ error: 'Soal dengan id tersebut tidak ditemukan.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Soal berhasil dihapus.',
      data: data
    });

  } catch (error) {
    console.error('DELETE /guidance-questions error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Maaf, terjadi gangguan saat menghapus soal.'
    });
  }
}
