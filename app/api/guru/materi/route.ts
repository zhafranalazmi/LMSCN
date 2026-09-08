import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Materi from "@/models/Materi";
import Guru from "@/models/Guru";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const materiList = await Materi.find({ guru: (session.user as any).id }).sort({ createdAt: -1 });
  return NextResponse.json(materiList);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { judul, deskripsi, mapel, kelas, tipeLampiran, lampiranUrl } = body;

  if (!judul || !mapel || !kelas || !tipeLampiran || !lampiranUrl) {
    return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 400 });
  }

  await connectDB();

  const guru = await Guru.findById((session.user as any).id).select("mapel kelasDiampu");
  if (!guru || !guru.mapel.includes(mapel) || !guru.kelasDiampu.includes(kelas)) {
    return NextResponse.json(
      { message: "Mapel atau kelas tidak valid untuk akunmu" },
      { status: 403 }
    );
  }

  const materi = await Materi.create({
    judul,
    deskripsi: deskripsi ?? "",
    mapel,
    kelas,
    tipeLampiran,
    lampiranUrl,
    guru: (session.user as any).id,
  });

  return NextResponse.json(materi, { status: 201 });
}