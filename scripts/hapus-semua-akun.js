require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI tidak ditemukan di .env.local");
  process.exit(1);
}

async function hapusSemuaAkun() {
  await mongoose.connect(MONGODB_URI);
  console.log("Terhubung ke database...");

  const koleksiAkun = ["admins", "gurus", "siswas", "kepseks", "kurikulums"];

  for (const nama of koleksiAkun) {
    const result = await mongoose.connection.db.collection(nama).deleteMany({});
    console.log(`${nama}: ${result.deletedCount} akun dihapus`);
  }

  console.log("Selesai. Semua akun sudah dihapus dari database.");
  await mongoose.disconnect();
}

hapusSemuaAkun().catch((err) => {
  console.error("Gagal menghapus akun:", err);
  process.exit(1);
});