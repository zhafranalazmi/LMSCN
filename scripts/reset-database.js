// Script buat WIPE HABIS semua data di database yang lagi dipakai
// (semua collection dihapus), buat "reset" pas mau pindah ke nama
// database yang lebih rapi. HATI-HATI: ini beneran hapus semua data.
//
// Cara pakai:
//   1. Pastiin MONGODB_URI di .env.local UDAH kamu ganti ke nama
//      database yang bener (lihat instruksi di chat)
//   2. Jalanin: node scripts/reset-database.js
//   3. Ketik "YAKIN" kalau muncul konfirmasi

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const readline = require("readline");

async function tanyaKonfirmasi(pertanyaan) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(pertanyaan, (jawaban) => {
      rl.close();
      resolve(jawaban);
    });
  });
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI gak ketemu di .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const dbName = mongoose.connection.db.databaseName;
  console.log(`Connected ke database: "${dbName}"`);

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`\nCollection yang bakal DIHAPUS SEMUA (${collections.length}):`);
  collections.forEach((c) => console.log(" -", c.name));

  const jawaban = await tanyaKonfirmasi(
    `\nYakin mau hapus SEMUA data di database "${dbName}"? Ketik YAKIN untuk lanjut: `
  );

  if (jawaban.trim() !== "YAKIN") {
    console.log("Dibatalkan, gak ada yang dihapus.");
    await mongoose.disconnect();
    return;
  }

  for (const c of collections) {
    await mongoose.connection.db.collection(c.name).drop();
    console.log("Dihapus:", c.name);
  }

  console.log("\nSelesai. Database sekarang kosong. Jalanin ulang script seed satu-satu.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Gagal:", err);
  process.exit(1);
});
