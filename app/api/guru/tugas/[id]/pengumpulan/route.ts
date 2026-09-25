import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import PengumpulanTugas from "@/models/PengumpulanTugas";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const tugas = await Tugas.findById(params.id);
  if (!tugas || tugas.guru.toString() !== (session.user as any).id) {
    return NextResponse.json({ message: "Tugas tidak ditemukan" }, { status: 404 });
  }

  const pengumpulanList = await PengumpulanTugas.find({ tugas: params.id })
    .populate("siswa", "name email")
    .sort({ createdAt: -1 });

  return NextResponse.json({ tugas: { judul: tugas.judul }, pengumpulanList });
}