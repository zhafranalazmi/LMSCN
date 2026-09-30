import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mammoth from "mammoth";
import { parseSoalFromText } from "@/lib/parseSoalWord";

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

  const isDocx =
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx");

  if (!isDocx) {
    return NextResponse.json({ message: "File harus berformat .docx" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const result = await mammoth.extractRawText({ buffer });
    const soal = parseSoalFromText(result.value);

    if (soal.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada soal yang terbaca. Cek kembali format dokumen." },
        { status: 400 }
      );
    }

    return NextResponse.json({ soal });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal membaca file Word" }, { status: 500 });
  }
}