import mongoose, { Schema, models, model } from "mongoose";

const KelasSchema = new Schema(
  {
    nama: { type: String, required: true },
    tingkat: { type: String, required: true },
    jurusan: { type: String, required: true },
  },
  { timestamps: true }
);

// Cegah error "OverwriteModelError" saat hot-reload di dev
const Kelas = models.Kelas || model("Kelas", KelasSchema);

export default Kelas;
