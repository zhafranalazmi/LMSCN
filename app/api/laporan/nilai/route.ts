import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Asesmen from "@/models/Asesmen";
import JawabanSiswa from "@/models/JawabanSiswa";
import Tugas from "@/models/Tugas";
import PengumpulanTugas from "@/models/PengumpulanTugas";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== "kepsek" && role !== "kurikulum")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const guruId = searchParams.get("guru");
  const mapel = searchParams.get("mapel");

  if (!guruId || !mapel) {
    return NextResponse.json({ message: "Parameter guru dan mapel wajib diisi" }, { status: 400 });
  }

  await connectDB();

  const asesmenList = await Asesmen.find({ guru: guruId, mapel }).select("judul");
  const asesmenIds = asesmenList.map((a) => a._id);
  const jawabanList = await JawabanSiswa.find({ asesmen: { $in: asesmenIds } }).populate(
    "siswa",
    "name email"
  );

  const tugasList = await Tugas.find({ guru: guruId, mapel }).select("judul");
  const tugasIds = tugasList.map((t) => t._id);
  const pengumpulanList = await PengumpulanTugas.find({ tugas: { $in: tugasIds } }).populate(
    "siswa",
    "name email"
  );

  const asesmenJudulMap = new Map(asesmenList.map((a) => [a._id.toString(), a.judul]));
  const tugasJudulMap = new Map(tugasList.map((t) => [t._id.toString(), t.judul]));

  const hasilAsesmen = jawabanList.map((j) => ({
    siswaName: (j.siswa as any)?.name ?? "-",
    siswaEmail: (j.siswa as any)?.email ?? "-",
    jenis: "Asesmen",
    judul: asesmenJudulMap.get(j.asesmen.toString()) ?? "-",
    nilai: j.nilaiTotal,
    status: j.status,
  }));

  const hasilTugas = pengumpulanList.map((p) => ({
    siswaName: (p.siswa as any)?.name ?? "-",
    siswaEmail: (p.siswa as any)?.email ?? "-",
    jenis: "Tugas",
    judul: tugasJudulMap.get(p.tugas.toString()) ?? "-",
    nilai: p.nilai,
    status: p.status,
  }));

  return NextResponse.json([...hasilAsesmen, ...hasilTugas]);
}