// Jalankan dengan: npm run seed
// Membuat 1 akun awal untuk tiap role supaya bisa langsung dicoba login.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: String,
    jurusan: String,
    kelas: String,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const seedUsers = [
  { name: "Admin Utama", email: "admin@citranegara.sch.id", role: "admin" },
  { name: "Budi Guru", email: "guru@citranegara.sch.id", role: "guru" },
  { name: "Kepsek Sekolah", email: "kepsek@citranegara.sch.id", role: "kepsek" },
  { name: "Tim Kurikulum", email: "kurikulum@citranegara.sch.id", role: "kurikulum" },
  {
    name: "Siswa Contoh",
    email: "siswa@citranegara.sch.id",
    role: "siswa",
    jurusan: "PPLG",
    kelas: "XII PPLG 1",
  },
];

const DEFAULT_PASSWORD = "password123"; // ganti setelah dipakai

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI belum di-set di .env.local");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Terkoneksi ke MongoDB...");

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const u of seedUsers) {
    await User.findOneAndUpdate(
      { email: u.email },
      { ...u, password: hashedPassword },
      { upsert: true, new: true }
    );
    console.log(`Seed akun: ${u.email} (role: ${u.role})`);
  }

  console.log(`\nSelesai. Semua akun pakai password: ${DEFAULT_PASSWORD}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
