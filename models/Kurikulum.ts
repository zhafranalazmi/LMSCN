import { Schema, models, model } from "mongoose";

const KurikulumSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const Kurikulum = models.Kurikulum || model("Kurikulum", KurikulumSchema);
export default Kurikulum;
