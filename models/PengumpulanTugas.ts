import { Schema, models, model } from "mongoose";

const PengumpulanTugasSchema = new Schema(
  {
    tugas: { type: Schema.Types.ObjectId, ref: "Tugas", required: true },
    siswa: { type: Schema.Types.ObjectId, ref: "Siswa", required: true },
    tipeLampiran: { type: String, enum: ["link", "pdf"], required: true },
    lampiranUrl: { type: String, required: true },
    nilai: { type: Number, default: null },
    status: {
      type: String,
      enum: ["belum_dinilai", "sudah_dinilai"],
      default: "belum_dinilai",
    },
  },
  { timestamps: true }
);

const PengumpulanTugas =
  models.PengumpulanTugas || model("PengumpulanTugas", PengumpulanTugasSchema);
export default PengumpulanTugas;