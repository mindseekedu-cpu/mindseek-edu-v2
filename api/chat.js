// api/chat.js
import { getSystemPrompt } from '../lib/prompts.js';
import { supabase } from '../lib/supabase-client.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan.' });
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
      userId
    } = req.body;

    if (!mode || !grade || !topic) {
      return res.status(400).json({ error: 'Mode, grade, dan topic wajib diisi.' });
    }

    const allowedModes = ['pr', 'practice', 'exam'];
    if (!allowedModes.includes(mode)) {
      return res.status(400).json({ error: 'Mode tidak valid.' });
    }

    // Gabungkan OCR jika ada
    let userMessage = message || '';
    if (ocrText && ocrText.trim()) {
      userMessage = userMessage 
        ? `${userMessage}\n\n[Hasil scan gambar]: ${ocrText}`
        : `[Hasil scan gambar]: ${ocrText}`;
    }

    // Ambil system prompt dasar
    let systemPrompt = getSystemPrompt(mode, language);
    
    // Untuk mode practice dan exam, tambahkan instruksi tentang topik
    let enhancedSystemPrompt = systemPrompt;
    if (mode === 'practice' || mode === 'exam') {
      enhancedSystemPrompt = `${systemPrompt}\n\nTopik yang dipilih siswa adalah: "${topic}" (kelas ${grade}, mata pelajaran ${subject}).\nGenerate soal sesuai topik tersebut. Jangan tanyakan topik lagi. Langsung mulai berikan soal.`;
    }

    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      { role: 'user', content: userMessage || (mode === 'practice' ? `Ayo latihan topik ${topic}` : (mode === 'exam' ? 'Ayo ujian' : '')) }
    ];

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      console.error('Chat Error: DEEPSEEK_API_KEY tidak ditemukan');
      return res.status(500).json({ error: 'Server tidak terkonfigurasi.' });
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

    // Simpan percakapan ke Supabase secara asinkron
    const userIdFinal = userId || sessionId || 'anonymous';
    const chatRecord = {
      user_id: userIdFinal,
      user_message: userMessage || message || '',
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
        if (error) console.error('Gagal simpan chat:', error.message);
      } catch (err) { console.error('Async save error:', err.message); }
    });

    return res.status(200).json({ success: true, reply: aiReply, sessionId: sessionId });
  } catch (error) {
    console.error('Chat handler error:', error.message);
    return res.status(500).json({ success: false, error: 'Maaf, Ai Mi sedang sibuk. Coba lagi nanti.' });
  }
}
