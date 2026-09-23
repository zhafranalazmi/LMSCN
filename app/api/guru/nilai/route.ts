import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Asesmen from "@/models/Asesmen";
import JawabanSiswa from "@/models/JawabanSiswa";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mapel = searchParams.get("mapel");
  const kelas = searchParams.get("kelas");

  if (!mapel || !kelas) {
    return NextResponse.json({ message: "Parameter mapel dan kelas wajib diisi" }, { status: 400 });
  }

  await connectDB();

  const asesmenList = await Asesmen.find({
    guru: (session.user as any).id,
    mapel,
    kelas,
  }).select("judul soal");

  const asesmenIds = asesmenList.map((a) => a._id);

  const jawabanList = await JawabanSiswa.find({
    asesmen: { $in: asesmenIds },
  }).populate("siswa", "name email");

  // Susun jadi tabel: baris = siswa, kolom = asesmen
   const siswaMap = new Map <string,
    { siswa: { name: string; email: string }; nilai: Record<string, { nilaiTotal: number; status: string } | null> }
  >();

  for (const asesmen of asesmenList) {
    // pastiin semua siswa yang udah pernah ngerjain minimal 1 asesmen kebentuk barisnya
  }

  for (const jawaban of jawabanList) {
    const siswaId = (jawaban.siswa as any)._id.toString();
    if (!siswaMap.has(siswaId)) {
      siswaMap.set(siswaId, {
        siswa: { name: (jawaban.siswa as any).name, email: (jawaban.siswa as any).email },
        nilai: {},
      });
    }
    siswaMap.get(siswaId)!.nilai[jawaban.asesmen.toString()] = {
      nilaiTotal: jawaban.nilaiTotal,
      status: jawaban.status,
    };
  }

  const rekap = Array.from(siswaMap.values());

  return NextResponse.json({
    asesmenList: asesmenList.map((a) => ({ _id: a._id, judul: a.judul })),
    rekap,
  });
}