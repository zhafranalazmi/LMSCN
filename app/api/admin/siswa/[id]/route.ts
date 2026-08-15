import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Siswa from "@/models/Siswa";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, password, jurusan, kelas } = body;

  if (!name || !email || !jurusan || !kelas) {
    return NextResponse.json(
      { message: "Nama, email, jurusan, dan kelas wajib diisi" },
      { status: 400 }
    );
  }

  await connectDB();

  const duplikat = await Siswa.findOne({
    email: email.toLowerCase(),
    _id: { $ne: params.id },
  });
  if (duplikat) {
    return NextResponse.json(
      { message: "Email sudah dipakai siswa lain" },
      { status: 400 }
    );
  }

  const update: any = {
    name,
    email: email.toLowerCase(),
    jurusan,
    kelas,
  };

  // Password cuma diupdate kalau diisi (kosong = gak diubah)
  if (password) {
    update.password = await bcrypt.hash(password, 10);
  }

  const siswa = await Siswa.findByIdAndUpdate(params.id, update, { new: true }).select(
    "-password"
  );

  if (!siswa) {
    return NextResponse.json({ message: "Siswa tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(siswa);
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
  await Siswa.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Siswa dihapus" });
}
