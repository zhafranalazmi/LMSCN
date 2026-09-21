import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Asesmen from "@/models/Asesmen";
import JawabanSiswa from "@/models/JawabanSiswa";

export async function PUT(
  req: Request,
  { params }: { params: { id: string; jawabanId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { penilaianEsai } = body; // array of { soalId, poinDiperoleh }

  if (!Array.isArray(penilaianEsai)) {
    return NextResponse.json({ message: "Data penilaian tidak valid" }, { status: 400 });
  }

  await connectDB();

  const asesmen = await Asesmen.findById(params.id);
  if (!asesmen || asesmen.guru.toString() !== (session.user as any).id) {
    return NextResponse.json({ message: "Asesmen tidak ditemukan" }, { status: 404 });
  }

  const jawabanSiswa = await JawabanSiswa.findById(params.jawabanId);
  if (!jawabanSiswa || jawabanSiswa.asesmen.toString() !== params.id) {
    return NextResponse.json({ message: "Jawaban tidak ditemukan" }, { status: 404 });
  }

  for (const item of jawabanSiswa.jawaban) {
    if (item.tipe === "esai") {
      const nilai = penilaianEsai.find(
        (p: any) => p.soalId === item.soalId.toString()
      );
      if (nilai) {
        item.poinDiperoleh = nilai.poinDiperoleh;
      }
    }
  }

  jawabanSiswa.nilaiTotal = jawabanSiswa.jawaban.reduce(
    (sum: number, item: any) => sum + (item.poinDiperoleh ?? 0),
    0
  );
  jawabanSiswa.status = "selesai";

  await jawabanSiswa.save();

  return NextResponse.json(jawabanSiswa);
}