import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Kelas from "@/models/Kelas";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const kelasList = await Kelas.find().sort({ tingkat: 1, jurusan: 1, nama: 1 });
  return NextResponse.json(kelasList);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { tingkat, jurusan } = body;

  if (!tingkat || !jurusan) {
    return NextResponse.json(
      { message: "Tingkat dan jurusan wajib diisi" },
      { status: 400 }
    );
  }

  await connectDB();

  // Hitung berapa kelas yang sudah ada dengan tingkat+jurusan yang sama,
  // lalu urutan berikutnya jadi nomor kelas baru (mis. "XI PPLG 3")
  const jumlahSekarang = await Kelas.countDocuments({ tingkat, jurusan });
  const nomorUrut = jumlahSekarang + 1;
  const nama = `${tingkat} ${jurusan} ${nomorUrut}`;

  const kelas = await Kelas.create({ nama, tingkat, jurusan });
  return NextResponse.json(kelas, { status: 201 });
}
