import { GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "stream";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

const BUCKET_NAME = "uploads";

export interface StoredFile {
  id: ObjectId;
  filename: string;
  contentType: string;
  size: number;
}

function getBucket() {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB belum terhubung");
  }

  return new GridFSBucket(db, { bucketName: BUCKET_NAME });
}

export async function storeUploadedFile(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  userId: string,
  role: string
): Promise<StoredFile> {
  await connectDB();

  const bucket = getBucket();
  const safeFileName = fileName.replace(/[\\/]+/g, "-").trim() || `file-${Date.now()}`;
  const uploadStream = bucket.openUploadStream(safeFileName, {
    metadata: {
      contentType,
      uploadedBy: userId,
      role,
      uploadedAt: new Date().toISOString(),
    },
  });

  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer)
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", resolve);
  });

  const uploadedFile = await bucket.find({ _id: uploadStream.id }).next();
  if (!uploadedFile) {
    throw new Error("File gagal disimpan di MongoDB");
  }

  return {
    id: uploadedFile._id as ObjectId,
    filename: uploadedFile.filename,
    contentType: uploadedFile.metadata?.contentType ?? contentType,
    size: uploadedFile.length,
  };
}

export async function getStoredFile(id: string) {
  await connectDB();

  if (!ObjectId.isValid(id)) {
    return null;
  }

  const bucket = getBucket();
  const file = await bucket.find({ _id: new ObjectId(id) }).next();
  return file;
}
