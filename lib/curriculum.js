// lib/curriculum.js
// Data kurikulum SD kelas 1-6 untuk MindSeek.edu
// Mata pelajaran: Matematika (umum) dan Sains (2 varian: Nasional/IPAS dan Internasional/Cambridge)
// Berdasarkan Capaian Pembelajaran Kurikulum Merdeka & Cambridge Primary

// ==================== MATEMATIKA (Spiral, sama untuk Nasional & Internasional) ====================
export const matematika = {
  "1": [
    "Bilangan 1-20",
    "Penjumlahan & Pengurangan (1-10)",
    "Bilangan 1-50",
    "Pengukuran (Panjang/Berat)",
    "Geometri 2D"
  ],
  "2": [
    "Bilangan 1-100",
    "Penjumlahan/Pengurangan (1-20)",
    "Perkalian Dasar",
    "Pembagian Dasar",
    "Waktu",
    "Uang",
    "Geometri"
  ],
  "3": [
    "Bilangan 1-1000",
    "Operasi Hitung (+,-)",
    "Perkalian",
    "Pembagian",
    "Pecahan Dasar",
    "Bangun Datar"
  ],
  "4": [
    "Bilangan Besar",
    "Pembagian Bersusun",
    "Luas & Keliling",
    "Pecahan Senilai",
    "Pola Bilangan",
    "Pengolahan Data",
    "Sudut"
  ],
  "5": [
    "Operasi Hitung Pecahan",
    "Bangun Ruang",
    "Desimal",
    "Persentase",
    "Perbandingan",
    "Pengolahan Data",
    "Koordinat"
  ],
  "6": [
    "Bilangan Bulat",
    "Operasi Campuran",
    "Bangun Ruang (Volume & Luas)",
    "Statistika",
    "Aljabar Dasar"
  ]
};

// ==================== SAINS NASIONAL (IPAS - Integratif) ====================
export const sainsNasional = {
  "1": [
    "Anggota Tubuh",
    "Panca Indra",
    "Benda di Sekitar",
    "Tanaman",
    "Keluarga",
    "Aturan di Rumah/Sekolah"
  ],
  "2": [
    "Bagian Tubuh Hewan & Tumbuhan",
    "Mengukur Benda",
    "Cuaca",
    "Lingkungan Sehat",
    "Ekosistem",
    "Sumber Daya"
  ],
  "3": [
    "Siklus Hidup",
    "Wujud Zat & Perubahan",
    "Norma Sosial",
    "Energi (Cahaya & Bunyi)",
    "Denah/Peta"
  ],
  "4": [
    "Fotosintesis",
    "Gaya",
    "Wujud Zat",
    "Transformasi Energi",
    "Sejarah Daerah",
    "Kekayaan Budaya"
  ],
  "5": [
    "Sistem Pencernaan & Pernapasan Manusia",
    "Ekosistem",
    "Listrik & Magnet",
    "Lingkungan"
  ],
  "6": [
    "Perkembangbiakan",
    "Tata Surya",
    "Kelistrikan",
    "Isu Global (Iklim)",
    "Peran Indonesia"
  ]
};

// ==================== SAINS INTERNASIONAL (Cambridge/Singapore - Inquiry based) ====================
export const sainsInternasional = {
  "1": [
    "Living vs Non-living",
    "Bagian Tubuh Hewan",
    "Parts of Plants",
    "Senses",
    "Materials (Texture & Properties)"
  ],
  "2": [
    "Life Cycles (Animals)",
    "Habitats",
    "Plants Growth",
    "Forces (Push/Pull)",
    "Light"
  ],
  "3": [
    "Human Skeleton & Muscles",
    "States of Matter",
    "Light & Shadows",
    "Electricity (Circuits)",
    "Earth"
  ],
  "4": [
    "Digestive System",
    "Sound",
    "Environment",
    "Changing States of Matter",
    "Rocks"
  ],
  "5": [
    "Circulatory System",
    "Reversible Changes",
    "Forces & Friction",
    "Space & Solar System"
  ],
  "6": [
    "Micro-organisms",
    "Classification of Living Things",
    "Energy Transfer",
    "Human Impact on Earth",
    "Evolution"
  ]
};

// ==================== OBJEK UTAMA (jika ingin akses per kelas + mapel) ====================
// Struktur: curriculum[grade][subject] = array of topics
// Subject: "Matematika", "Sains_Nasional", "Sains_Internasional"
export const curriculum = {
  "1": {
    "Matematika": matematika["1"],
    "Sains_Nasional": sainsNasional["1"],
    "Sains_Internasional": sainsInternasional["1"]
  },
  "2": {
    "Matematika": matematika["2"],
    "Sains_Nasional": sainsNasional["2"],
    "Sains_Internasional": sainsInternasional["2"]
  },
  "3": {
    "Matematika": matematika["3"],
    "Sains_Nasional": sainsNasional["3"],
    "Sains_Internasional": sainsInternasional["3"]
  },
  "4": {
    "Matematika": matematika["4"],
    "Sains_Nasional": sainsNasional["4"],
    "Sains_Internasional": sainsInternasional["4"]
  },
  "5": {
    "Matematika": matematika["5"],
    "Sains_Nasional": sainsNasional["5"],
    "Sains_Internasional": sainsInternasional["5"]
  },
  "6": {
    "Matematika": matematika["6"],
    "Sains_Nasional": sainsNasional["6"],
    "Sains_Internasional": sainsInternasional["6"]
  }
};