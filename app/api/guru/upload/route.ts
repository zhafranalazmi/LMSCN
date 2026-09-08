import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

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

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = `data:application/pdf;base64,${buffer.toString("base64")}`;

  try {
    const result = await cloudinary.uploader.upload(base64, {
      resource_type: "raw",
      folder: "tugas",
      public_id: `${Date.now()}-${file.name.replace(/\.pdf$/i, "")}`,
      format: "pdf",
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengunggah file" }, { status: 500 });
  }
}