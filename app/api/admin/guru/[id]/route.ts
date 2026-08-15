import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Guru from "@/models/Guru";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, password, mapel, walasKelas } = body;

  if (!name || !email) {
    return NextResponse.json(
      { message: "Nama dan email wajib diisi" },
      { status: 400 }
    );
  }

  await connectDB();

  const duplikatEmail = await Guru.findOne({
    email: email.toLowerCase(),
    _id: { $ne: params.id },
  });
  if (duplikatEmail) {
    return NextResponse.json(
      { message: "Email sudah dipakai guru lain" },
      { status: 400 }
    );
  }

  if (walasKelas) {
    const duplikatWalas = await Guru.findOne({
      walasKelas,
      _id: { $ne: params.id },
    });
    if (duplikatWalas) {
      return NextResponse.json(
        { message: `Kelas ${walasKelas} sudah punya wali kelas` },
        { status: 400 }
      );
    }
  }

  const update: any = {
    name,
    email: email.toLowerCase(),
    mapel: Array.isArray(mapel) ? mapel : [],
    walasKelas: walasKelas || null,
  };

  if (password) {
    update.password = await bcrypt.hash(password, 10);
  }

  const guru = await Guru.findByIdAndUpdate(params.id, update, { new: true }).select(
    "-password"
  );

  if (!guru) {
    return NextResponse.json({ message: "Guru tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(guru);
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
  await Guru.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Guru dihapus" });
}
