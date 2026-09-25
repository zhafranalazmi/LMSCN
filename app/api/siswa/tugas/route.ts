import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import PengumpulanTugas from "@/models/PengumpulanTugas";

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

  const tugasList = await Tugas.find({ kelas }).sort({ deadline: 1 });

  const pengumpulanSaya = await PengumpulanTugas.find({ siswa: siswaId }).select(
    "tugas nilai status tipeLampiran lampiranUrl"
  );
  const pengumpulanMap = new Map(
    pengumpulanSaya.map((p) => [p.tugas.toString(), p])
  );

  const hasil = tugasList.map((t) => {
    const p = pengumpulanMap.get(t._id.toString());
    return {
      _id: t._id,
      judul: t.judul,
      deskripsi: t.deskripsi,
      mapel: t.mapel,
      deadline: t.deadline,
      tipeLampiran: t.tipeLampiran,
      lampiranUrl: t.lampiranUrl,
      sudahKumpul: !!p,
      nilai: p?.nilai ?? null,
      statusPengumpulan: p?.status ?? null,
    };
  });

  return NextResponse.json(hasil);
}