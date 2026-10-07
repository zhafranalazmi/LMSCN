import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { storeUploadedFile } from "@/lib/gridfs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "siswa") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "File PDF wajib dipilih" }, { status: 400 });
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ message: "File harus berformat PDF" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ message: "Ukuran PDF maksimal 10 MB" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const storedFile = await storeUploadedFile(
      buffer,
      file.name,
      "application/pdf",
      (session.user as any).id,
      "siswa"
    );

    return NextResponse.json({
      url: `/api/files/${storedFile.id.toString()}`,
      fileId: storedFile.id.toString(),
    });
  } catch (error) {
    console.error("Gagal menyimpan PDF ke MongoDB:", error);
    return NextResponse.json({ message: "Gagal mengunggah PDF ke penyimpanan" }, { status: 500 });
  }
}