import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Asesmen from "@/models/Asesmen";
import Guru from "@/models/Guru";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const asesmenList = await Asesmen.find({ guru: (session.user as any).id })
    .select("-soal.jawabanBenar")
    .sort({ createdAt: -1 });
  return NextResponse.json(asesmenList);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { judul, deskripsi, mapel, kelas, durasiMenit, soal } = body;

  if (!judul || !mapel || !kelas || !durasiMenit || !Array.isArray(soal) || soal.length === 0) {
    return NextResponse.json(
      { message: "Judul, mapel, kelas, durasi, dan minimal 1 soal wajib diisi" },
      { status: 400 }
    );
  }

  for (const s of soal) {
    if (!s.pertanyaan || !s.tipe) {
      return NextResponse.json({ message: "Ada soal yang belum lengkap" }, { status: 400 });
    }
    if (s.tipe === "pg") {
      if (!Array.isArray(s.pilihan) || s.pilihan.length < 2) {
        return NextResponse.json(
          { message: "Soal pilihan ganda butuh minimal 2 pilihan" },
          { status: 400 }
        );
      }
      if (s.jawabanBenar === null || s.jawabanBenar === undefined) {
        return NextResponse.json(
          { message: "Soal pilihan ganda butuh jawaban benar" },
          { status: 400 }
        );
      }
    }
  }

  await connectDB();

  const guru = await Guru.findById((session.user as any).id).select("mapel kelasDiampu");
  if (!guru || !guru.mapel.includes(mapel) || !guru.kelasDiampu.includes(kelas)) {
    return NextResponse.json(
      { message: "Mapel atau kelas tidak valid untuk akunmu" },
      { status: 403 }
    );
  }

  const asesmen = await Asesmen.create({
    judul,
    deskripsi: deskripsi ?? "",
    mapel,
    kelas,
    durasiMenit,
    soal,
    guru: (session.user as any).id,
  });

  return NextResponse.json(asesmen, { status: 201 });
}