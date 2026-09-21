import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Materi from "@/models/Materi";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const materi = await Materi.findById(params.id);
  if (!materi) {
    return NextResponse.json({ message: "Materi tidak ditemukan" }, { status: 404 });
  }
  if (materi.guru.toString() !== (session.user as any).id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await Materi.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Materi dihapus" });
}