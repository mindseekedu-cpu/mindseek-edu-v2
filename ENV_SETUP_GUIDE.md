# Panduan Setup Environment Variables untuk Founder MindSeek.edu

Panduan ini untuk mengisi variabel lingkungan (environment variables) di **Vercel dashboard**.  
Tidak perlu menggunakan terminal atau kode apapun.

---

## Daftar Variabel yang Wajib Diisi

| Nama Variabel | Fungsi | Dimana Mendapatkannya |
|---------------|--------|----------------------|
| `DEEPSEEK_API_KEY` | Kunci untuk akses AI DeepSeek (chat, evaluasi) | [platform.deepseek.com](https://platform.deepseek.com) → Buat akun → Dashboard → API Keys |
| `SUPABASE_URL` | Alamat database Supabase proyek Anda | Dashboard Supabase → Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Kunci publik untuk mengakses Supabase dari frontend | Dashboard Supabase → Project Settings → API → Project API keys → `anon public` key |
| `OCR_SPACE_API_KEY` | Kunci untuk OCR (scan tulisan tangan siswa) | [ocr.space](https://ocr.space/) → Daftar gratis → Dashboard → API Key |

---

## Cara Mengisi di Vercel Dashboard (Langkah demi Langkah)

1. **Login ke Vercel** → Buka [vercel.com](https://vercel.com) dan login dengan akun tim MindSeek.

2. **Pilih project MindSeek-edu** (jika belum ada, nanti akan diimport dari GitHub setelah semua file siap).

3. **Masuk ke Settings** → Klik tab **"Settings"** di navbar atas project.

4. **Cari menu Environment Variables** → Di sidebar kiri, klik **"Environment Variables"**.

5. **Tambah satu per satu**:
   - Klik tombol **"Add New"**.
   - Isi **Name** (contoh: `DEEPSEEK_API_KEY`).
   - Isi **Value** (kunci rahasia yang sudah didapatkan dari platform masing-masing).
   - Pilih environment: **Production**, **Preview**, dan **Development** (centang semua untuk kemudahan).
   - Klik **"Save"**.

6. **Ulangi langkah 5 untuk keempat variabel** (`DEEPSEEK_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `OCR_SPACE_API_KEY`).

7. **Redeploy project** (opsional tapi disarankan):
   - Setelah semua variabel ditambahkan, buka tab **"Deployments"**.
   - Klik menu titik tiga di sebelah deployment terakhir → pilih **"Redeploy"** → **"Redeploy with existing Build Cache"** (atau tanpa cache).

> ✅ Selesai! Aplikasi sekarang akan bisa membaca variabel-variabel tersebut.

---

## ⚠️ Peringatan Penting

- **Jangan pernah commit file `.env` asli ke GitHub.** File tersebut berisi kunci rahasia.
- `.env.example` (yang sudah ada di repo) **boleh di-commit** karena hanya berisi nama variabel tanpa nilai.
- Pastikan file `.env` sudah masuk ke `.gitignore` jika suatu saat dibuat untuk testing lokal.

---

## Untuk Testing Lokal (Opsional, Nanti Saja)

Jika suatu saat ingin menjalankan proyek di komputer sendiri (lokal):

1. Buat file `.env` di root folder proyek (salin dari `.env.example`).
2. Isi nilai variabel dengan kunci asli (sama seperti di Vercel).
3. Jangan commit file `.env` ini ke GitHub.

Tapi untuk tahap awal, **tidak perlu setup lokal**. Cukup isi variabel di Vercel dashboard seperti panduan di atas.

---

## Kontak jika ada kendala

Simpan panduan ini di folder proyek atau di Notion tim. Bisa juga ditempel di README utama nanti.
