// Script buat bikin akun admin di collection "Admin" yang baru.
// Cara pakai:
//   1. Isi NAME, EMAIL, PASSWORD di bawah ini
//   2. Jalanin di terminal (dari root folder project): node scripts/seed-admin.js
//   3. Kalau muncul "Cannot find module 'dotenv'", jalanin dulu: npm install dotenv

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ==== ISI DATA ADMIN DI SINI ====
const NAME = "Nama Admin";
const EMAIL = "admin@gmail.com";
const PASSWORD = "123";
// =================================

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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

  const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

  const existing = await Admin.findOne({ email: EMAIL.toLowerCase() });
  if (existing) {
    console.log("Akun admin dengan email ini udah ada, gak dibuat ulang.");
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  await Admin.create({
    name: NAME,
    email: EMAIL.toLowerCase(),
    password: hashedPassword,
  });

  console.log("Akun admin berhasil dibuat:", EMAIL);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Gagal:", err);
  process.exit(1);
});
