// Script buat generate guru random: 3-4 guru per mapel yang ada di database,
// lalu pastiin SEMUA kelas kebagian wali kelas (walas).
// Password semua guru: "123"
//
// Cara pakai:
//   1. Pastiin kelas udah ada (scripts/seed-kelas.js) dan minimal 1 mapel
//      udah ditambahin lewat halaman Manajemen Guru & Mapel. Kalau belum
//      ada mapel sama sekali, script ini otomatis bikinin beberapa mapel
//      default biar tetep bisa jalan.
//   2. Jalanin: node scripts/seed-guru.js

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ==== ATUR DI SINI ====
const MIN_GURU_PER_MAPEL = 3;
const MAX_GURU_PER_MAPEL = 4;
const PASSWORD_DEFAULT = "123";
const DEFAULT_MAPEL_KALAU_KOSONG = [
  "Matematika", "Bahasa Indonesia", "Bahasa Inggris", "PPKn",
  "Pendidikan Agama", "PJOK", "Kewirausahaan", "IPAS",
];
// =======================

const NAMA_DEPAN = [
  "Agus", "Bambang", "Cahya", "Dian", "Endang", "Fitri", "Gunawan", "Hesti",
  "Irwan", "Juwita", "Kurnia", "Lina", "Muslim", "Nurul", "Oktavia",
  "Purwanto", "Ratih", "Slamet", "Titin", "Untung", "Vera", "Wahyu", "Yulia",
];
const NAMA_BELAKANG = [
  "Santoso", "Wibisono", "Rahayu", "Susanto", "Hartono", "Maulana",
  "Puspita", "Gunardi", "Siregar", "Halim", "Yuliana", "Prasetyo",
];

const MapelSchema = new mongoose.Schema(
  { nama: { type: String, required: true, unique: true } },
  { timestamps: true }
);

const KelasSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    tingkat: { type: String, required: true },
    jurusan: { type: String, required: true },
  },
  { timestamps: true }
);

const GuruSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mapel: { type: [String], default: [] },
    walasKelas: { type: String, default: null },
  },
  { timestamps: true }
);

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buatNamaRandom() {
  return `${randomFrom(NAMA_DEPAN)} ${randomFrom(NAMA_BELAKANG)}`;
}

function slugifyEmail(nama, unikNomor) {
  const slug = nama.toLowerCase().replace(/[^a-z]+/g, ".");
  return `guru.${slug}.${unikNomor}@citranegara.sch.id`;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI gak ketemu di .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected ke MongoDB");

  const Mapel = mongoose.models.Mapel || mongoose.model("Mapel", MapelSchema);
  const Kelas = mongoose.models.Kelas || mongoose.model("Kelas", KelasSchema);
  const Guru = mongoose.models.Guru || mongoose.model("Guru", GuruSchema);

  // Pastiin ada mapel. Kalau kosong, bikinin default dulu.
  let mapelList = await Mapel.find();
  if (mapelList.length === 0) {
    console.log("Belum ada mapel, bikin mapel default dulu...");
    for (const nama of DEFAULT_MAPEL_KALAU_KOSONG) {
      await Mapel.create({ nama });
    }
    mapelList = await Mapel.find();
  }

  const kelasList = await Kelas.find();
  if (kelasList.length === 0) {
    console.log("Belum ada kelas sama sekali. Jalanin scripts/seed-kelas.js dulu.");
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(PASSWORD_DEFAULT, 10);
  let emailCounter = 1;
  let totalGuruDibuat = 0;

  async function buatGuruBaru(mapelUntukGuru) {
    const nama = buatNamaRandom();
    let email = slugifyEmail(nama, emailCounter);
    emailCounter++;
    while (await Guru.findOne({ email })) {
      email = slugifyEmail(nama, emailCounter);
      emailCounter++;
    }

    const guru = await Guru.create({
      name: nama,
      email,
      password: hashedPassword,
      mapel: mapelUntukGuru,
      walasKelas: null,
    });
    totalGuruDibuat++;
    return guru;
  }

  // 1) Generate 3-4 guru per mapel
  for (const mapel of mapelList) {
    const jumlahSekarang = await Guru.countDocuments({ mapel: mapel.nama });
    const target = randomInt(MIN_GURU_PER_MAPEL, MAX_GURU_PER_MAPEL);
    const kurang = target - jumlahSekarang;

    if (kurang <= 0) {
      console.log(`Mapel ${mapel.nama}: udah ada ${jumlahSekarang} guru, dilewati.`);
      continue;
    }

    for (let i = 0; i < kurang; i++) {
      await buatGuruBaru([mapel.nama]);
    }
    console.log(`Mapel ${mapel.nama}: ditambah ${kurang} guru.`);
  }

  // 2) Pastiin semua kelas punya walas
  let dijadikanWalas = 0;
  let guruBaruUntukWalas = 0;

  for (const kelas of kelasList) {
    const sudahAdaWalas = await Guru.findOne({ walasKelas: kelas.nama });
    if (sudahAdaWalas) continue;

    // Cari guru yang belum jadi walas kelas manapun
    let guruBebas = await Guru.findOne({ walasKelas: null });

    if (!guruBebas) {
      // Gak ada guru nganggur, bikin guru baru khusus buat jadi walas
      const mapelAcak = randomFrom(mapelList).nama;
      guruBebas = await buatGuruBaru([mapelAcak]);
      guruBaruUntukWalas++;
    }

    guruBebas.walasKelas = kelas.nama;
    await guruBebas.save();
    dijadikanWalas++;
  }

  console.log(`\nSelesai.`);
  console.log(`- ${totalGuruDibuat} guru baru dibuat (termasuk ${guruBaruUntukWalas} guru tambahan khusus buat walas).`);
  console.log(`- ${dijadikanWalas} kelas baru dikasih wali kelas.`);
  console.log(`- Password semua guru: "${PASSWORD_DEFAULT}"`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Gagal:", err);
  process.exit(1);
});
