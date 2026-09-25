import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import PengumpulanTugas from "@/models/PengumpulanTugas";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "siswa") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const kelas = (session.user as any).kelas;
  const siswaId = (session.user as any).id;

  const body = await req.json();
  const { tipeLampiran, lampiranUrl } = body;

  if (!tipeLampiran || !lampiranUrl) {
    return NextResponse.json({ message: "Lampiran wajib diisi" }, { status: 400 });
  }

  await connectDB();

  const tugas = await Tugas.findOne({ _id: params.id, kelas });
  if (!tugas) {
    return NextResponse.json({ message: "Tugas tidak ditemukan" }, { status: 404 });
  }

  const sudahAda = await PengumpulanTugas.findOne({ tugas: params.id, siswa: siswaId });
  if (sudahAda) {
    return NextResponse.json({ message: "Kamu sudah mengumpulkan tugas ini" }, { status: 400 });
  }

  const pengumpulan = await PengumpulanTugas.create({
    tugas: params.id,
    siswa: siswaId,
    tipeLampiran,
    lampiranUrl,
  });

  return NextResponse.json(pengumpulan, { status: 201 });
}