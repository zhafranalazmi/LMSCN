// Script buat generate kelas otomatis: tiap tingkat x tiap jurusan
// akan dibikin 5 kelas (nomor 1-5).
// Cara pakai:
//   1. (Opsional) Ubah TINGKAT_LIST / JURUSAN_LIST / JUMLAH_KELAS_PER_JURUSAN di bawah
//   2. Jalanin di terminal (dari root folder project): node scripts/seed-kelas.js
//   3. Kalau muncul "Cannot find module 'dotenv'", jalanin dulu: npm install dotenv

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

// ==== ATUR DI SINI ====
const TINGKAT_LIST = ["X", "XI", "XII"];
const JURUSAN_LIST = ["PPLG", "MPLB", "PM", "TJKT", "DKV", "Perhotelan"];
const JUMLAH_KELAS_PER_JURUSAN = 5;
// =======================

const KelasSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    tingkat: { type: String, required: true },
    jurusan: { type: String, required: true },
  },
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

  const Kelas = mongoose.models.Kelas || mongoose.model("Kelas", KelasSchema);

  let dibuat = 0;
  let dilewati = 0;

  for (const tingkat of TINGKAT_LIST) {
    for (const jurusan of JURUSAN_LIST) {
      for (let i = 1; i <= JUMLAH_KELAS_PER_JURUSAN; i++) {
        const nama = `${tingkat} ${jurusan} ${i}`;

        const existing = await Kelas.findOne({ nama });
        if (existing) {
          dilewati++;
          continue;
        }

        await Kelas.create({ nama, tingkat, jurusan });
        console.log("Dibuat:", nama);
        dibuat++;
      }
    }
  }

  console.log(`\nSelesai. ${dibuat} kelas baru dibuat, ${dilewati} dilewati (udah ada).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Gagal:", err);
  process.exit(1);
});
