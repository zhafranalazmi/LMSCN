import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Asesmen from "@/models/Asesmen";
import JawabanSiswa from "@/models/JawabanSiswa";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "siswa") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const kelas = (session.user as any).kelas;
  const siswaId = (session.user as any).id;

  await connectDB();

  const asesmen = await Asesmen.findOne({ _id: params.id, kelas }).select(
    "-soal.jawabanBenar"
  );
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

  return NextResponse.json(asesmen);
}