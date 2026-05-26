# MindSeek.edu – Sprint 1

Platform belajar matematika interaktif untuk anak-anak dengan petunjuk bertahap dan pendampingan AI.

---

## Struktur Proyek
mindseek-edu/
├── app/
│   ├── api/
│   │   └── practice/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ChatInterface.tsx
│   ├── ClueBox.tsx
│   ├── ModeDropdown.tsx
│   └── QuestionBox.tsx
├── lib/
│   └── constants.ts
├── types/
│   └── index.ts
├── .env.local.example
├── package.json
├── tailwind.config.js
└── tsconfig.json

---

## Cara Menjalankan Lokal

### 1. Clone & Install

```bash
git clone https://github.com/your-org/mindseek-edu.git
cd mindseek-edu
npm install
```

### 2. Setup Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` sesuai kebutuhan (Sprint 1 tidak memerlukan API key eksternal).

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 4. Build Production

```bash
npm run build
npm start
```

---

## Cara Penggunaan

### Memulai Sesi Belajar

Ketik pesan berikut di kolom chat:
Halo Ai Mi, saya kelas 1, topik Penjumlahan. Siap belajar dengan bahasa Indonesia

### Pola Trigger
Halo Ai Mi, saya kelas [kelas], topik [topik]. Siap belajar dengan bahasa [bahasa]

| Parameter | Contoh nilai         |
|-----------|----------------------|
| kelas     | 1, 2, 3              |
| topik     | Penjumlahan          |
| bahasa    | Indonesia, Inggris   |

### Mekanisme Petunjuk

| Jawaban ke- | Respons sistem                                      |
|-------------|-----------------------------------------------------|
| Benar       | Pujian dan konfirmasi                               |
| Salah ke-1  | "Belum tepat" + Petunjuk 1                          |
| Salah ke-2  | "Belum tepat" + Petunjuk 1 & 2                      |
| Salah ke-3  | "Belum tepat" + Petunjuk 1, 2 & 3                   |
| Salah ke-4  | "Belum tepat" + Petunjuk 1, 2, 3 & 4               |
| Salah ke-5  | "Belum tepat" + Petunjuk 1–5                        |
| Salah ke-6+ | Tampilkan pilihan: Ganti soal / Coba lagi / Bantuan |

---

## Spesifikasi Teknis

| Item           | Detail                        |
|----------------|-------------------------------|
| Framework      | Next.js 14 (App Router)       |
| Bahasa         | TypeScript                    |
| Styling        | Tailwind CSS 3.4              |
| State          | React useState (frontend)     |
| Database       | Tidak digunakan (Sprint 1)    |
| API Eksternal  | Tidak digunakan (Sprint 1)    |
| Deployment     | Vercel                        |

---

## Deploy ke Vercel

### Opsi A – Vercel CLI

```bash
npm i -g vercel
vercel
```

### Opsi B – GitHub Integration

1. Push repository ke GitHub.
2. Buka [vercel.com](https://vercel.com) → **New Project**.
3. Import repository → pilih **Next.js** sebagai framework.
4. Klik **Deploy**.

### Environment Variables di Vercel

Tambahkan variabel dari `.env.local.example` di dashboard Vercel:
**Settings → Environment Variables**

---

## Fitur Sprint 1

- [x] Landing page dengan header dan footer
- [x] Dropdown mode: Practice / PR (default: Practice)
- [x] Chat interface dengan bubble percakapan
- [x] Trigger pola pesan untuk memulai sesi
- [x] API endpoint `/api/practice` (POST)
- [x] Soal statis: "Berapakah 2 + 3?" (jawaban: 5)
- [x] Petunjuk bertahap (5 level)
- [x] Fallback tombol setelah 5 petunjuk habis
- [x] Tanpa kata "salah", "gagal", atau simbol negatif
- [x] Animasi chat bubble dan petunjuk
- [x] Responsive mobile & desktop
- [x] Build tanpa error di Vercel

## Roadmap Sprint 2

- [ ] Integrasi Supabase untuk menyimpan progres
- [ ] Integrasi Deepseek AI untuk soal dinamis
- [ ] Mode PR dengan pengumpulan jawaban
- [ ] Multi-topik: Pengurangan, Perkalian, Pembagian
- [ ] Sistem reward dan badge
- [ ] Laporan progres untuk orang tua

---

## Kontribusi

Proyek ini dikembangkan dalam siklus sprint. Untuk kontribusi:

1. Fork repository
2. Buat branch fitur: `git checkout -b feat/nama-fitur`
3. Commit: `git commit -m "feat: deskripsi fitur"`
4. Push & buat Pull Request

---

## Lisensi

© 2024 MindSeek.edu – All rights reserved.