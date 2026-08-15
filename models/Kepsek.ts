import { Schema, models, model } from "mongoose";

const KepsekSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const Kepsek = models.Kepsek || model("Kepsek", KepsekSchema);
export default Kepsek;
