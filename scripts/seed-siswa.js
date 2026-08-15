// Script buat generate 20 siswa random ke SETIAP kelas yang udah ada di database.
// Semua siswa passwordnya "123".
// Cara pakai:
//   1. Pastikan udah jalanin scripts/seed-kelas.js dulu (kelasnya harus udah ada)
//   2. Jalanin di terminal (dari root folder project): node scripts/seed-siswa.js
//   3. Kalau muncul "Cannot find module 'dotenv'", jalanin dulu: npm install dotenv

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ==== ATUR DI SINI ====
const JUMLAH_SISWA_PER_KELAS = 20;
const PASSWORD_DEFAULT = "123";
const EMAIL_DOMAIN = "siswa.citranegara.sch.id";
// =======================

const NAMA_DEPAN = [
  "Ahmad", "Budi", "Citra", "Dewi", "Eka", "Fajar", "Gita", "Hendra",
  "Indah", "Joko", "Kartika", "Lestari", "Muhammad", "Nadia", "Oki",
  "Putri", "Rizky", "Sari", "Taufik", "Umi", "Vina", "Wahyu", "Yusuf",
  "Zahra", "Agus", "Bella", "Dian", "Fitri", "Galih", "Hana",
];
const NAMA_BELAKANG = [
  "Pratama", "Wijaya", "Saputra", "Lestari", "Kusuma", "Ramadhan",
  "Utami", "Setiawan", "Handayani", "Nugraha", "Anggraini", "Firmansyah",
  "Maharani", "Hidayat", "Puspita", "Santoso", "Aditya", "Rahayu",
  "Permana", "Wulandari",
];

const KelasSchema = new mongoose.Schema(
  { nama: String, tingkat: String, jurusan: String },
  { timestamps: true }
);

const SiswaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    jurusan: { type: String, required: true },
    kelas: { type: String, required: true },
  },
  { timestamps: true }
);

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z]/g, "");
}

async function generateUniqueEmail(Siswa, namaDepan, namaBelakang) {
  // Coba beberapa kali sampai dapet email yang belum kepakai
  for (let attempt = 0; attempt < 20; attempt++) {
    const angka = Math.floor(100 + Math.random() * 900); // 3 digit random
    const email = `${slugify(namaDepan)}.${slugify(namaBelakang)}${angka}@${EMAIL_DOMAIN}`;
    const existing = await Siswa.findOne({ email });
    if (!existing) return email;
  }
  // Fallback kalau 20x nyoba masih bentrok (jarang banget terjadi)
  return `siswa${Date.now()}${Math.floor(Math.random() * 1000)}@${EMAIL_DOMAIN}`;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI gak ketemu di .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected ke MongoDB");

  const Kelas = mongoose.models.Kelas || mongoose.model("Kelas", KelasSchema);
  const Siswa = mongoose.models.Siswa || mongoose.model("Siswa", SiswaSchema);

  const kelasList = await Kelas.find();
  if (kelasList.length === 0) {
    console.log("Belum ada kelas sama sekali. Jalanin scripts/seed-kelas.js dulu.");
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(PASSWORD_DEFAULT, 10);
  let totalDibuat = 0;

  for (const kelas of kelasList) {
    const jumlahSekarang = await Siswa.countDocuments({ kelas: kelas.nama });
    const jumlahDibutuhkan = JUMLAH_SISWA_PER_KELAS - jumlahSekarang;

    if (jumlahDibutuhkan <= 0) {
      console.log(`${kelas.nama}: udah ada ${jumlahSekarang} siswa, dilewati.`);
      continue;
    }

    for (let i = 0; i < jumlahDibutuhkan; i++) {
      const namaDepan = randomFrom(NAMA_DEPAN);
      const namaBelakang = randomFrom(NAMA_BELAKANG);
      const name = `${namaDepan} ${namaBelakang}`;
      const email = await generateUniqueEmail(Siswa, namaDepan, namaBelakang);

      await Siswa.create({
        name,
        email,
        password: hashedPassword,
        jurusan: kelas.jurusan,
        kelas: kelas.nama,
      });

      totalDibuat++;
    }

    console.log(`${kelas.nama}: dibuat ${jumlahDibutuhkan} siswa baru.`);
  }

  console.log(`\nSelesai. Total ${totalDibuat} siswa baru dibuat. Password semua: "${PASSWORD_DEFAULT}"`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Gagal:", err);
  process.exit(1);
});
