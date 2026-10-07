import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { storeUploadedFile } from "@/lib/gridfs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ message: "File wajib diunggah" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ message: "File harus berupa PDF" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ message: "Ukuran PDF maksimal 10 MB" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const storedFile = await storeUploadedFile(
      buffer,
      file.name,
      file.type,
      (session.user as any).id,
      "guru"
    );

    return NextResponse.json({
      url: `/api/files/${storedFile.id.toString()}`,
      fileId: storedFile.id.toString(),
    });
  } catch (error) {
    console.error("Gagal menyimpan PDF ke MongoDB:", error);
    return NextResponse.json({ message: "Gagal mengunggah file" }, { status: 500 });
  }
}