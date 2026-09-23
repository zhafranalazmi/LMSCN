import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Asesmen from "@/models/Asesmen";
import JawabanSiswa from "@/models/JawabanSiswa";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "siswa") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const kelas = (session.user as any).kelas;
  const siswaId = (session.user as any).id;
  if (!kelas) {
    return NextResponse.json([]);
  }

  await connectDB();

  const asesmenList = await Asesmen.find({ kelas })
    .select("-soal.jawabanBenar")
    .sort({ createdAt: -1 });

  const jawabanSaya = await JawabanSiswa.find({ siswa: siswaId }).select(
    "asesmen nilaiTotal status"
  );
  const jawabanMap = new Map(jawabanSaya.map((j) => [j.asesmen.toString(), j]));

  const hasil = asesmenList.map((a) => {
    const jawaban = jawabanMap.get(a._id.toString());
    return {
      _id: a._id,
      judul: a.judul,
      deskripsi: a.deskripsi,
      mapel: a.mapel,
      durasiMenit: a.durasiMenit,
      jumlahSoal: a.soal.length,
      sudahDikerjakan: !!jawaban,
      nilaiTotal: jawaban?.nilaiTotal ?? null,
      status: jawaban?.status ?? null,
    };
  });

  return NextResponse.json(hasil);
}