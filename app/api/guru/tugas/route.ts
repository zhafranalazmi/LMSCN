import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import Guru from "@/models/Guru";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const tugasList = await Tugas.find({ guru: (session.user as any).id }).sort({ createdAt: -1 });
  return NextResponse.json(tugasList);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { judul, deskripsi, mapel, kelas, deadline, tipeLampiran, lampiranUrl } = body;

  if (!judul || !mapel || !kelas || !deadline || !tipeLampiran || !lampiranUrl) {
    return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 400 });
  }

  await connectDB();

  // Validasi: guru cuma boleh bikin tugas untuk mapel & kelas yang dia ampu
  const guru = await Guru.findById((session.user as any).id).select("mapel kelasDiampu");
  if (!guru || !guru.mapel.includes(mapel) || !guru.kelasDiampu.includes(kelas)) {
    return NextResponse.json(
      { message: "Mapel atau kelas tidak valid untuk akunmu" },
      { status: 403 }
    );
  }

  const tugas = await Tugas.create({
    judul,
    deskripsi: deskripsi ?? "",
    mapel,
    kelas,
    deadline: new Date(deadline),
    tipeLampiran,
    lampiranUrl,
    guru: (session.user as any).id,
  });

  return NextResponse.json(tugas, { status: 201 });
}