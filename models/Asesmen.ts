import { Schema, models, model } from "mongoose";

const SoalSchema = new Schema(
  {
    tipe: { type: String, enum: ["pg", "esai"], required: true },
    pertanyaan: { type: String, required: true },
    // Cuma dipakai kalau tipe = "pg"
    pilihan: { type: [String], default: [] },
    jawabanBenar: { type: Number, default: null }, // index ke array pilihan
    poin: { type: Number, required: true, default: 10 },
  },
  { _id: true }
);

const AsesmenSchema = new Schema(
  {
    judul: { type: String, required: true },
    deskripsi: { type: String, default: "" },
    mapel: { type: String, required: true },
    kelas: { type: String, required: true },
    durasiMenit: { type: Number, required: true },
    soal: { type: [SoalSchema], default: [] },
    guru: { type: Schema.Types.ObjectId, ref: "Guru", required: true },
  },
  { timestamps: true }
);

const Asesmen = models.Asesmen || model("Asesmen", AsesmenSchema);
export default Asesmen;