import { Schema, models, model } from "mongoose";

const GuruSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Daftar nama mapel yang diajar, bisa lebih dari satu
    mapel: { type: [String], default: [] },
    // Nama kelas yang diwalikan, kosong/null kalau bukan wali kelas.
    // 1 guru maksimal jadi walas 1 kelas.
    walasKelas: { type: String, default: null },
  },
  { timestamps: true }
);

const Guru = models.Guru || model("Guru", GuruSchema);
export default Guru;
