import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import PengumpulanTugas from "@/models/PengumpulanTugas";

export async function PUT(
  req: Request,
  { params }: { params: { id: string; pengumpulanId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { nilai } = body;

  if (nilai === undefined || nilai === null) {
    return NextResponse.json({ message: "Nilai wajib diisi" }, { status: 400 });
  }

  await connectDB();

  const tugas = await Tugas.findById(params.id);
  if (!tugas || tugas.guru.toString() !== (session.user as any).id) {
    return NextResponse.json({ message: "Tugas tidak ditemukan" }, { status: 404 });
  }

  const pengumpulan = await PengumpulanTugas.findOneAndUpdate(
    { _id: params.pengumpulanId, tugas: params.id },
    { nilai, status: "sudah_dinilai" },
    { new: true }
  );

  if (!pengumpulan) {
    return NextResponse.json({ message: "Pengumpulan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(pengumpulan);
}