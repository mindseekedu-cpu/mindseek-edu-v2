'use client';

import { useState } from 'react';

interface ChatInterfaceProps {
  mode: 'Practice' | 'PR';
}

export default function ChatInterface({ mode }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'Halo! Aku Ai Mi, teman belajar matematikamu 😊\nUntuk memulai sesi belajar, ketik pesan seperti ini:\n"Halo Ai Mi, saya kelas 1, topik Penjumlahan. Siap belajar dengan bahasa Indonesia"\nAku siap menemani belajar! 😊' }
  ]);
  const [input, setInput] = useState('');
  const [question, setQuestion] = useState<{ text: string; answer: number; clueIndex: number } | null>(null);
  const [clueCount, setClueCount] = useState(0);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);

    // Deteksi trigger
    const triggerRegex = /Halo Ai Mi, saya kelas \d+, topik (\w+). Siap belajar dengan bahasa \w+/i;
    const match = userMsg.match(triggerRegex);
    if (match && match[1].toLowerCase() === 'penjumlahan') {
      // Mulai soal
      setQuestion({ text: 'Berapakah 2 + 3?', answer: 5, clueIndex: 0 });
      setClueCount(0);
      setMessages(prev => [...prev, { sender: 'ai', text: 'Baik, mari kita mulai! Soal: Berapakah 2 + 3?' }]);
    } 
    else if (question) {
      // Cek jawaban
      const userAnswer = parseInt(userMsg);
      if (isNaN(userAnswer)) {
        setMessages(prev => [...prev, { sender: 'ai', text: 'Ketik angka ya, misal: 5' }]);
      } else if (userAnswer === question.answer) {
        setMessages(prev => [...prev, { sender: 'ai', text: '⭐ Hebat! Jawabanmu benar! 🎉' }]);
        setQuestion(null);
        setClueCount(0);
      } else {
        // Jawaban salah, beri petunjuk
        const clues = [
          'Coba hitung menggunakan jari. Berapa 2 jari ditambah 3 jari?',
          'Angka 2 dan 3, jika digabung menjadi berapa?',
          '2 + 3 sama dengan 5, coba ketik 5.',
          'Bayangkan kamu punya 2 permen, lalu diberi 3 permen. Berapa total permenmu?',
          'Hitung mundur dari 5: 5,4,3,2,1. Nah, 2+3 adalah angka pertama dari hitungan itu.'
        ];
        const newClueCount = clueCount + 1;
        setClueCount(newClueCount);
        if (newClueCount <= 5) {
          setMessages(prev => [...prev, { sender: 'ai', text: `Belum tepat. Petunjuk ${newClueCount}: ${clues[newClueCount-1]}` }]);
        }
        if (newClueCount === 5) {
          // Setelah 5 petunjuk, tampilkan pilihan
          setMessages(prev => [...prev, { sender: 'ai', text: 'Sepertinya soal ini sulit. Pilih:\n1️⃣ Ganti soal lain\n2️⃣ Coba lagi (Ai Mi terus bimbing)\n3️⃣ Minta bantuan orang tua/guru\n\nKetik 1, 2, atau 3' }]);
        }
        if (newClueCount > 5) {
          // handle pilihan
          if (userMsg === '1') {
            setMessages(prev => [...prev, { sender: 'ai', text: 'Baik, ganti soal lain (fitur sedang dikembangkan untuk Sprint 2).' }]);
            setQuestion(null);
            setClueCount(0);
          } else if (userMsg === '2') {
            setMessages(prev => [...prev, { sender: 'ai', text: 'Ayo coba lagi. ' + clues[4] }]);
            setClueCount(4); // reset ke petunjuk ke-5? biarkan saja
          } else if (userMsg === '3') {
            setMessages(prev => [...prev, { sender: 'ai', text: 'Baik, akan kusimpan untuk didiskusikan dengan orang tua.' }]);
            setQuestion(null);
            setClueCount(0);
          }
        }
      }
    } 
    else {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Untuk mulai belajar, kirim pesan seperti: "Halo Ai Mi, saya kelas 1, topik Penjumlahan. Siap belajar dengan bahasa Indonesia"' }]);
    }

    setInput('');
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100'}`}>
            <strong>{msg.sender === 'user' ? 'Saya' : 'Ai Mi'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <textarea
          className="flex-1 border rounded p-2"
          rows={2}
          placeholder="Ketik pesanmu di sini..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <button onClick={handleSend} className="bg-green-500 text-white px-4 py-2 rounded">Kirim</button>
      </div>
    </div>
  );
}
