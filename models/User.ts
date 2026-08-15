import mongoose, { Schema, models, model } from "mongoose";

export const ROLES = ["admin", "guru", "kepsek", "kurikulum", "siswa"] as const;
export type Role = (typeof ROLES)[number];

export const JURUSAN = ["PPLG", "MPLB", "PM", "TJKT", "DV", "Perhotelan"] as const;
export type Jurusan = (typeof JURUSAN)[number];

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string; // hashed
  role: Role;
  // hanya relevan untuk role "siswa" dan bisa juga dipakai guru pengampu jurusan
  jurusan?: Jurusan;
  kelas?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true },
    jurusan: { type: String, enum: JURUSAN },
    kelas: { type: String },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
