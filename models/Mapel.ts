import { Schema, models, model } from "mongoose";

const MapelSchema = new Schema(
  {
    nama: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Mapel = models.Mapel || model("Mapel", MapelSchema);
export default Mapel;
