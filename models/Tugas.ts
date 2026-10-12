import { Schema, models, model } from "mongoose";

const TugasSchema = new Schema(
  {
    judul: { type: String, required: true },
    deskripsi: { type: String, default: "" },
    mapel: { type: String, required: true },
    kelas: { type: String, required: true },
    deadline: { type: Date, required: true },
    // "link" = guru paste URL (Google Drive dll), "pdf" = file diunggah ke Cloudinary
    tipeLampiran: { type: String, enum: ["link", "pdf"], required: true },
    lampiranUrl: { type: String, required: true },
    guru: { type: Schema.Types.ObjectId, ref: "Guru", required: true },
  },
  { timestamps: true }
);

const Tugas = models.Tugas || model("Tugas", TugasSchema);
export default Tugas;