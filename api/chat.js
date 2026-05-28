// api/chat.js
// Vercel Serverless Function untuk komunikasi dengan AI DeepSeek
// Menerima student_id (wajib) untuk identitas siswa

import { getSystemPrompt } from '../lib/prompts.js';
import { supabase } from '../lib/supabase-client.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan. Gunakan POST.' });
  }

  try {
    const {
      mode,
      grade,
      topic,
      subject,
      language = 'id',
      message,
      ocrText,
      sessionId,
      studentId,       // <-- Ganti dari userId/sessionId ke student_id
      questionHistory = []
    } = req.body;

    // Validasi input wajib
    if (!mode || !grade || !topic || !studentId) {
      return res.status(400).json({ error: 'Mode, grade, topic, dan studentId wajib diisi.' });
    }

    const allowedModes = ['pr', 'practice', 'exam'];
    if (!allowedModes.includes(mode)) {
      return res.status(400).json({ error: 'Mode tidak valid. Gunakan: pr, practice, atau exam.' });
    }

    if (!message && !ocrText) {
      return res.status(400).json({ error: 'Pesan atau hasil OCR tidak boleh kosong.' });
    }

    let userMessage = message || '';
    if (ocrText && ocrText.trim()) {
      userMessage = userMessage 
        ? `${userMessage}\n\n[Hasil scan gambar]: ${ocrText}`
        : `[Hasil scan gambar]: ${ocrText}`;
    }

    const systemPrompt = getSystemPrompt(mode, language);
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    if (questionHistory && questionHistory.length > 0) {
      messages.push(...questionHistory);
    }
    messages.push({ role: 'user', content: userMessage });

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      console.error('Chat Error: DEEPSEEK_API_KEY tidak ditemukan');
      return res.status(500).json({ error: 'Server tidak terkonfigurasi dengan benar.' });
    }

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

    // Simpan percakapan ke tabel chats dengan student_id (tanpa blok response)
    const chatRecord = {
      student_id: studentId,        // <-- menggunakan student_id
      user_message: userMessage,
      ai_message: aiReply,
      subject: subject || null,
      grade: grade,
      topic: topic,
      session_type: mode,
      timestamp: new Date().toISOString()
    };

    Promise.resolve().then(async () => {
      try {
        const { error } = await supabase.from('chats').insert(chatRecord);
        if (error) console.error('Gagal simpan chat ke Supabase:', error.message);
      } catch (err) {
        console.error('Error async save chat:', err.message);
      }
    });

    return res.status(200).json({
      success: true,
      reply: aiReply,
      sessionId: sessionId || null
    });

  } catch (error) {
    console.error('Chat handler error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Maaf, Ai Mi sedang sibuk. Coba lagi beberapa saat.'
    });
  }
}
