import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Guru from "@/models/Guru";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const guru = await Guru.findById((session.user as any).id).select("mapel kelasDiampu");

  if (!guru) {
    return NextResponse.json({ message: "Guru tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ mapel: guru.mapel ?? [], kelasDiampu: guru.kelasDiampu ?? [] });
}