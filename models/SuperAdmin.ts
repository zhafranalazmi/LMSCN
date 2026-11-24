import { Schema, models, model } from "mongoose";

const SuperAdminSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const SuperAdmin = models.SuperAdmin || model("SuperAdmin", SuperAdminSchema);
export default SuperAdmin;
