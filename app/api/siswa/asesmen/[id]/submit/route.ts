import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Asesmen from "@/models/Asesmen";
import JawabanSiswa from "@/models/JawabanSiswa";

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
  const { jawaban, waktuMulai } = body; // jawaban: [{ soalId, tipe, jawabanPg?, jawabanEsai? }]

  if (!Array.isArray(jawaban) || !waktuMulai) {
    return NextResponse.json({ message: "Data jawaban tidak valid" }, { status: 400 });
  }

  await connectDB();

  const asesmen = await Asesmen.findOne({ _id: params.id, kelas });
  if (!asesmen) {
    return NextResponse.json({ message: "Asesmen tidak ditemukan" }, { status: 404 });
  }

  const sudahAda = await JawabanSiswa.findOne({ asesmen: params.id, siswa: siswaId });
  if (sudahAda) {
    return NextResponse.json(
      { message: "Kamu sudah mengerjakan asesmen ini" },
      { status: 400 }
    );
  }

  let adaEsai = false;

  const jawabanFinal = jawaban.map((item: any) => {
    const soal = asesmen.soal.find((s: any) => s._id.toString() === item.soalId);
    if (!soal) return null;

    if (soal.tipe === "pg") {
      const benar = item.jawabanPg === soal.jawabanBenar;
      return {
        soalId: soal._id,
        tipe: "pg",
        jawabanPg: item.jawabanPg ?? null,
        jawabanEsai: "",
        poinDiperoleh: benar ? soal.poin : 0,
      };
    }

    adaEsai = true;
    return {
      soalId: soal._id,
      tipe: "esai",
      jawabanPg: null,
      jawabanEsai: item.jawabanEsai ?? "",
      poinDiperoleh: 0,
    };
  }).filter(Boolean);

  const nilaiTotal = jawabanFinal.reduce(
    (sum: number, item: any) => sum + item.poinDiperoleh,
    0
  );

  const jawabanSiswa = await JawabanSiswa.create({
    asesmen: params.id,
    siswa: siswaId,
    jawaban: jawabanFinal,
    nilaiTotal,
    status: adaEsai ? "menunggu_penilaian" : "selesai",
    waktuMulai: new Date(waktuMulai),
    waktuSelesai: new Date(),
  });

  return NextResponse.json(jawabanSiswa, { status: 201 });
}