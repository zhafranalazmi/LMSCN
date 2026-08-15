import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Kepsek from "@/models/Kepsek";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, password } = body;

  if (!name || !email) {
    return NextResponse.json(
      { message: "Nama dan email wajib diisi" },
      { status: 400 }
    );
  }

  await connectDB();

  const duplikat = await Kepsek.findOne({
    email: email.toLowerCase(),
    _id: { $ne: params.id },
  });
  if (duplikat) {
    return NextResponse.json(
      { message: "Email sudah dipakai akun lain" },
      { status: 400 }
    );
  }

  const update: any = { name, email: email.toLowerCase() };
  if (password) {
    update.password = await bcrypt.hash(password, 10);
  }

  const akun = await Kepsek.findByIdAndUpdate(params.id, update, {
    new: true,
  }).select("-password");

  if (!akun) {
    return NextResponse.json({ message: "Akun tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(akun);
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
  await Kepsek.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Akun dihapus" });
}
