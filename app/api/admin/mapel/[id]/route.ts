import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Mapel from "@/models/Mapel";
import Guru from "@/models/Guru";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const mapel = await Mapel.findById(params.id);
  if (!mapel) {
    return NextResponse.json({ message: "Mapel tidak ditemukan" }, { status: 404 });
  }

  // Lepasin mapel ini dari semua guru yang ngajar mapel itu, biar gak nyangkut
  await Guru.updateMany({ mapel: mapel.nama }, { $pull: { mapel: mapel.nama } });
  await Mapel.findByIdAndDelete(params.id);

  return NextResponse.json({ message: "Mapel dihapus" });
}
