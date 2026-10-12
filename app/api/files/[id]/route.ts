import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { createCloudinaryPdfDownloadUrl } from "@/lib/cloudinary";
import { getStoredFile } from "@/lib/gridfs";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const cloudinaryPublicId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[A-Za-z0-9_.-]+\.pdf$/i;
  if (cloudinaryPublicId.test(params.id)) {
    try {
      return NextResponse.redirect(createCloudinaryPdfDownloadUrl(params.id));
    } catch (error) {
      console.error("Gagal membuat tautan unduhan Cloudinary:", error);
      return NextResponse.json(
        { message: "Gagal membuat tautan unduhan file" },
        { status: 500 }
      );
    }
  }

  const file = await getStoredFile(params.id);
  if (!file) {
    return NextResponse.json({ message: "File tidak ditemukan" }, { status: 404 });
  }

  const db = mongoose.connection.db;
  if (!db) {
    return NextResponse.json({ message: "Database tidak tersedia" }, { status: 500 });
  }

 const fileId = new mongoose.Types.ObjectId(String(file._id));

const downloadStream = new mongoose.mongo.GridFSBucket(db, {
  bucketName: "uploads",
}).openDownloadStream(fileId);

  return new NextResponse(downloadStream as any, {
    headers: {
      "Content-Type": file.metadata?.contentType ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${file.filename}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}