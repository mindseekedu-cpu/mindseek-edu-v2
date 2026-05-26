import { Question, FallbackOption } from "@/types";

export const TRIGGER_PATTERN =
  /Halo Ai Mi, saya kelas (.+?), topik (.+?)\. Siap belajar dengan bahasa (.+)/i;

export const WELCOME_MESSAGE = `Halo! Aku Ai Mi, teman belajar matematikamu 🤖✨

Untuk memulai sesi belajar, ketik pesan seperti ini:

"Halo Ai Mi, saya kelas 1, topik Penjumlahan. Siap belajar dengan bahasa Indonesia"

Aku siap menemanimu belajar! 💪`;

export const STATIC_QUESTION: Question = {
  id: "q-penjumlahan-001",
  text: "Berapakah 2 + 3?",
  answer: 5,
  topic: "Penjumlahan",
  clues: [
    "Coba hitung menggunakan jari. Berapa 2 jari ditambah 3 jari?",
    "Angka 2 dan 3, jika digabung menjadi berapa?",
    "2 + 3 sama dengan 5, coba ketik 5.",
    "Yuk coba lagi pelan-pelan: satu, dua... lalu tiga, empat, lima. Jawabannya ada di sana! 🌟",
    "Kamu pasti bisa! Jawabannya adalah angka setelah 4. Coba ketik angka itu ya! 😊",
  ],
  meta: {
    kelas: "",
    topik: "",
    bahasa: "",
  },
};

export const FALLBACK_OPTIONS: FallbackOption[] = [
  {
    id: "change",
    emoji: "1️⃣",
    label: "Ganti soal lain",
  },
  {
    id: "retry",
    emoji: "2️⃣",
    label: "Coba lagi",
  },
  {
    id: "parent",
    emoji: "3️⃣",
    label: "Minta bantuan orang tua",
  },
];