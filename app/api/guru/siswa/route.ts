import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Guru from "@/models/Guru";
import Siswa from "@/models/Siswa";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const kelas = searchParams.get("kelas");

  if (!kelas) {
    return NextResponse.json({ message: "Parameter kelas wajib diisi" }, { status: 400 });
  }

  await connectDB();

  const guru = await Guru.findById((session.user as any).id).select("kelasDiampu");
  if (!guru || !guru.kelasDiampu.includes(kelas)) {
    return NextResponse.json({ message: "Kamu tidak mengampu kelas ini" }, { status: 403 });
  }

  const siswaList = await Siswa.find({ kelas }).select("-password").sort({ name: 1 });
  return NextResponse.json(siswaList);
}