import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Tugas from "@/models/Tugas";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const tugas = await Tugas.findById(params.id);
  if (!tugas) {
    return NextResponse.json({ message: "Tugas tidak ditemukan" }, { status: 404 });
  }
  if (tugas.guru.toString() !== (session.user as any).id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await Tugas.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Tugas dihapus" });
}  