import { Schema, models, model } from "mongoose";

const SiswaSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    jurusan: { type: String, required: true },
    kelas: { type: String, required: true },
  },
  { timestamps: true }
);

const Siswa = models.Siswa || model("Siswa", SiswaSchema);
export default Siswa;
