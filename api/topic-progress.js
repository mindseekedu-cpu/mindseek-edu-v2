// api/topic-progress.js
// Vercel Serverless Function untuk membaca dan memperbarui progress siswa per topik
// Endpoint: GET (baca progress) dan POST (increment progress)

import { supabase } from '../lib/supabase-client.js';

export default async function handler(req, res) {
  // Hanya menerima GET dan POST
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ error: 'Method tidak diizinkan. Gunakan GET atau POST.' });
  }
}

// Handler untuk GET request
async function handleGet(req, res) {
  try {
    const { userId, grade, topic } = req.query;

    // Validasi userId dan grade wajib ada
    if (!userId || !grade) {
      return res.status(400).json({ 
        error: 'Parameter userId dan grade wajib diisi.' 
      });
    }

    // Jika topic disertakan: ambil satu topik
    if (topic) {
      const { data, error } = await supabase
        .from('topics_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('grade', grade)
        .eq('topic', topic)
        .maybeSingle();

      if (error) {
        console.error('Get single topic error:', error.message);
        throw new Error('Gagal mengambil data progress.');
      }

      // Jika tidak ditemukan, kembalikan object kosong dengan default values
      if (!data) {
        return res.status(200).json({
          user_id: userId,
          grade: grade,
          topic: topic,
          total_questions: 0,
          independent_count: 0,
          easy_count: 0,
          medium_count: 0,
          hard_count: 0,
          last_practiced: null
        });
      }

      return res.status(200).json(data);
    } 
    // Tanpa topic: ambil semua topik untuk grade tertentu
    else {
      const { data, error } = await supabase
        .from('topics_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('grade', grade)
        .order('topic', { ascending: true });

      if (error) {
        console.error('Get all topics error:', error.message);
        throw new Error('Gagal mengambil data progress.');
      }

      return res.status(200).json(data || []);
    }
  } catch (error) {
    console.error('GET /topic-progress error:', error.message);
    return res.status(500).json({ 
      error: 'Maaf, terjadi gangguan saat mengambil data progress.' 
    });
  }
}

// Handler untuk POST request (increment progress)
async function handlePost(req, res) {
  try {
    const {
      userId,
      grade,
      topic,
      subject,
      incrementTotalQuestions = 0,
      incrementIndependent = 0,
      incrementEasy = 0,
      incrementMedium = 0,
      incrementHard = 0
    } = req.body;

    // Validasi input wajib
    if (!userId || !grade || !topic) {
      return res.status(400).json({ 
        error: 'userId, grade, dan topic wajib diisi.' 
      });
    }

    // Ambil data existing (jika ada)
    const { data: existing, error: fetchError } = await supabase
      .from('topics_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('grade', grade)
      .eq('topic', topic)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Fetch existing progress error:', fetchError.message);
      throw new Error('Gagal membaca data progress saat ini.');
    }

    // Hitung nilai baru (akumulasi)
    const newTotal = (existing?.total_questions || 0) + incrementTotalQuestions;
    const newIndependent = (existing?.independent_count || 0) + incrementIndependent;
    const newEasy = (existing?.easy_count || 0) + incrementEasy;
    const newMedium = (existing?.medium_count || 0) + incrementMedium;
    const newHard = (existing?.hard_count || 0) + incrementHard;
    const newLastPracticed = new Date().toISOString();

    // Data untuk upsert
    const progressData = {
      user_id: userId,
      grade: grade,
      topic: topic,
      subject: subject || existing?.subject || null,
      total_questions: newTotal,
      independent_count: newIndependent,
      easy_count: newEasy,
      medium_count: newMedium,
      hard_count: newHard,
      last_practiced: newLastPracticed
    };

    // Upsert (insert atau update)
    const { data: upserted, error: upsertError } = await supabase
      .from('topics_progress')
      .upsert(progressData, {
        onConflict: 'user_id, grade, topic',
        returning: 'representation'
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Upsert progress error:', upsertError.message);
      throw new Error('Gagal menyimpan progress.');
    }

    return res.status(200).json({
      success: true,
      message: 'Progress berhasil diperbarui.',
      data: upserted
    });

  } catch (error) {
    console.error('POST /topic-progress error:', error.message);
    return res.status(500).json({ 
      success: false,
      error: 'Maaf, terjadi gangguan saat menyimpan progress.' 
    });
  }
}
