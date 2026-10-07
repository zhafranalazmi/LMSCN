import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
