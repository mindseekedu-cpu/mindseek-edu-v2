// api/chat.js
// Vercel Serverless Function untuk komunikasi dengan AI DeepSeek
// Endpoint utama untuk semua mode: PR, Practice, Exam

import { getSystemPrompt } from '../lib/prompts.js';
import { supabase } from '../lib/supabase-client.js';

export default async function handler(req, res) {
  // Hanya menerima method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan. Gunakan POST.' });
  }

  try {
    // Parse request body
    const {
      mode,
      grade,
      topic,
      subject,
      language = 'id',
      message,
      ocrText,
      sessionId,
      questionHistory = []
    } = req.body;

    // Validasi input wajib
    if (!mode || !grade || !topic) {
      return res.status(400).json({ error: 'Mode, grade, dan topic wajib diisi.' });
    }

    // Validasi mode yang diperbolehkan
    const allowedModes = ['pr', 'practice', 'exam'];
    if (!allowedModes.includes(mode)) {
      return res.status(400).json({ error: 'Mode tidak valid. Gunakan: pr, practice, atau exam.' });
    }

    // Pastikan ada pesan (kecuali mungkin untuk inisialisasi? Tapi untuk MVP, wajib ada)
    if (!message && !ocrText) {
      return res.status(400).json({ error: 'Pesan atau hasil OCR tidak boleh kosong.' });
    }

    // Gabungkan pesan user dengan OCR text jika ada
    let userMessage = message || '';
    if (ocrText && ocrText.trim()) {
      userMessage = userMessage 
        ? `${userMessage}\n\n[Hasil scan gambar]: ${ocrText}`
        : `[Hasil scan gambar]: ${ocrText}`;
    }

    // Ambil system prompt berdasarkan mode dan bahasa
    const systemPrompt = getSystemPrompt(mode, language);

    // Siapkan array messages untuk DeepSeek API
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Jika ada questionHistory (riwayat soal dan jawaban) untuk konteks, tambahkan ke messages
    // Format yang diharapkan: [{ role: 'user' atau 'assistant', content: '...' }]
    if (questionHistory && questionHistory.length > 0) {
      messages.push(...questionHistory);
    }

    // Tambahkan pesan user terbaru
    messages.push({ role: 'user', content: userMessage });

    // Baca API Key DeepSeek
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      console.error('Chat Error: DEEPSEEK_API_KEY tidak ditemukan');
      return res.status(500).json({ error: 'Server tidak terkonfigurasi dengan benar.' });
    }

    // Panggil DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('DeepSeek API error:', deepseekResponse.status, errorText);
      throw new Error('DeepSeek API gagal');
    }

    const deepseekData = await deepseekResponse.json();
    const aiReply = deepseekData.choices[0]?.message?.content || 'Maaf, Ai Mi tidak bisa menjawab saat ini.';

    // --- Simpan percakapan ke Supabase secara asinkron (jangan blok response) ---
    // Gunakan user_id sementara: jika ada sessionId pakai itu, else 'anonymous'
    const userId = sessionId || 'anonymous';
    const chatRecord = {
      user_id: userId,
      user_message: userMessage,
      ai_message: aiReply,
      subject: subject || null,
      grade: grade,
      topic: topic,
      session_type: mode,
      timestamp: new Date().toISOString()
    };

    // Simpan tanpa await, biarkan berjalan di background
    Promise.resolve().then(async () => {
      try {
        const { error } = await supabase.from('chats').insert(chatRecord);
        if (error) {
          console.error('Gagal simpan chat ke Supabase:', error.message);
        }
      } catch (err) {
        console.error('Error async save chat:', err.message);
      }
    });

    // Kirim respons sukses ke frontend
    return res.status(200).json({
      success: true,
      reply: aiReply,
      sessionId: sessionId // bisa dikembalikan untuk digunakan frontend
    });

  } catch (error) {
    console.error('Chat handler error:', error.message);
    // Pesan ramah untuk user
    return res.status(500).json({
      success: false,
      error: 'Maaf, Ai Mi sedang sibuk. Coba lagi beberapa saat.'
    });
  }
}
