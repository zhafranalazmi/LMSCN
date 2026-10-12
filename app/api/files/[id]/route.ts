import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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

  const bucket = (await import("mongoose")).default.connection.db;
  if (!bucket) {
    return NextResponse.json({ message: "Database tidak tersedia" }, { status: 500 });
  }

  const { GridFSBucket } = await import("mongodb");
  const downloadStream = new GridFSBucket(bucket, { bucketName: "uploads" }).openDownloadStream(file._id);

  return new NextResponse(downloadStream as any, {
    headers: {
      "Content-Type": file.metadata?.contentType ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${file.filename}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
