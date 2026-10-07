import { Schema, models, model } from "mongoose";

const PengajaranSchema = new Schema(
  {
    mapel: { type: String, required: true },
    kelas: { type: [String], default: [] },
  },
  { _id: false }
);

const GuruSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Daftar nama mapel yang diajar, bisa lebih dari satu
    mapel: { type: [String], default: [] },
    // Daftar nama kelas yang diampu (di-assign oleh admin), bisa lebih dari satu
    kelasDiampu: { type: [String], default: [] },
    pengajaran: { type: [PengajaranSchema], default: undefined },
  },
  { timestamps: true }
);

const Guru = models.Guru || model("Guru", GuruSchema);
export default Guru;