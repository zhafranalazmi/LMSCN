import { Schema, models, model } from "mongoose";

const UploadedFileSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true },
    uploadedBy: { type: String, required: true },
    role: { type: String, enum: ["guru", "siswa"], required: true },
  },
  { timestamps: true }
);

const UploadedFile = models.UploadedFile || model("UploadedFile", UploadedFileSchema);
export default UploadedFile;
