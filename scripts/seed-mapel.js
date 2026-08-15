// Script buat generate mata pelajaran: normatif/umum + produktif per jurusan.
// Aman dijalanin berkali-kali, mapel yang udah ada dilewati (gak dobel).
//
// Cara pakai: node scripts/seed-mapel.js

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

// ==== DAFTAR MAPEL ====
const MAPEL_UMUM = [
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "PPKn",
  "Pendidikan Agama",
  "PJOK",
  "Sejarah Indonesia",
  "IPAS",
  "Seni Budaya",
  "Kewirausahaan",
  "Projek Kreatif dan Kewirausahaan",
  "Bahasa Jawa",
  "Informatika",
];

const MAPEL_PRODUKTIF = {
  PPLG: [
    "Pemrograman Web dan Perangkat Bergerak",
    "Pemrograman Perangkat Lunak",
    "Basis Data",
    "Pemodelan Perangkat Lunak",
    "Praktik Kerja Lapangan PPLG",
  ],
  MPLB: [
    "Otomatisasi Tata Kelola Perkantoran",
    "Kepegawaian",
    "Humas dan Keprotokolan",
    "Kearsipan",
    "Praktik Kerja Lapangan MPLB",
  ],
  PM: [
    "Perencanaan Bisnis",
    "Penataan Produk",
    "Administrasi Transaksi",
    "Bisnis Online",
    "Praktik Kerja Lapangan PM",
  ],
  TJKT: [
    "Teknologi Jaringan Kabel dan Nirkabel",
    "Administrasi Infrastruktur Jaringan",
    "Teknologi Layanan Jaringan",
    "Keamanan Jaringan",
    "Praktik Kerja Lapangan TJKT",
  ],
  DV: [
    "Videografi",
    "Fotografi",
    "Desain Grafis Percetakan",
    "Animasi 2D dan 3D",
    "Praktik Kerja Lapangan DV",
  ],
  Perhotelan: [
    "Housekeeping",
    "Food and Beverage Service",
    "Front Office",
    "Tata Graha",
    "Praktik Kerja Lapangan Perhotelan",
  ],
};
// =======================

const MapelSchema = new mongoose.Schema(
  { nama: { type: String, required: true, unique: true } },
  { timestamps: true }
);

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI gak ketemu di .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected ke MongoDB");

  const Mapel = mongoose.models.Mapel || mongoose.model("Mapel", MapelSchema);

  const semuaMapel = [
    ...MAPEL_UMUM,
    ...Object.values(MAPEL_PRODUKTIF).flat(),
  ];

  let dibuat = 0;
  let dilewati = 0;

  for (const nama of semuaMapel) {
    const existing = await Mapel.findOne({ nama });
    if (existing) {
      dilewati++;
      continue;
    }
    await Mapel.create({ nama });
    console.log("Dibuat:", nama);
    dibuat++;
  }

  console.log(`\nSelesai. ${dibuat} mapel baru dibuat, ${dilewati} dilewati (udah ada).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Gagal:", err);
  process.exit(1);
});
