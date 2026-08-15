import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Kelas from "@/models/Kelas";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { nama, tingkat, jurusan } = body;

  if (!nama || !tingkat || !jurusan) {
    return NextResponse.json(
      { message: "Nama, tingkat, dan jurusan wajib diisi" },
      { status: 400 }
    );
  }

  await connectDB();

  const duplikat = await Kelas.findOne({ nama, _id: { $ne: params.id } });
  if (duplikat) {
    return NextResponse.json(
      { message: "Nama kelas sudah dipakai kelas lain" },
      { status: 400 }
    );
  }

  const kelas = await Kelas.findByIdAndUpdate(
    params.id,
    { nama, tingkat, jurusan },
    { new: true }
  );

  if (!kelas) {
    return NextResponse.json({ message: "Kelas tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(kelas);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  await Kelas.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Kelas dihapus" });
}
