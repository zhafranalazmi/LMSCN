import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Materi from "@/models/Materi";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "siswa") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const kelas = (session.user as any).kelas;
  if (!kelas) {
    return NextResponse.json([]);
  }

  await connectDB();
  const materiList = await Materi.find({ kelas }).sort({ createdAt: -1 });
  return NextResponse.json(materiList);
}