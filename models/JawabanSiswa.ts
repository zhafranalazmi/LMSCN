import { Schema, models, model } from "mongoose";

const JawabanItemSchema = new Schema(
  {
    soalId: { type: Schema.Types.ObjectId, required: true },
    tipe: { type: String, enum: ["pg", "esai"], required: true },
    jawabanPg: { type: Number, default: null },
    jawabanEsai: { type: String, default: "" },
    poinDiperoleh: { type: Number, default: 0 },
  },
  { _id: false }
);

const JawabanSiswaSchema = new Schema(
  {
    asesmen: { type: Schema.Types.ObjectId, ref: "Asesmen", required: true },
    siswa: { type: Schema.Types.ObjectId, ref: "Siswa", required: true },
    jawaban: { type: [JawabanItemSchema], default: [] },
    nilaiTotal: { type: Number, default: 0 },
    // "menunggu_penilaian" = ada esai yang belum dinilai guru
    status: {
      type: String,
      enum: ["menunggu_penilaian", "selesai"],
      default: "menunggu_penilaian",
    },
    waktuMulai: { type: Date, required: true },
    waktuSelesai: { type: Date, required: true },
  },
  { timestamps: true }
);

const JawabanSiswa = models.JawabanSiswa || model("JawabanSiswa", JawabanSiswaSchema);
export default JawabanSiswa;