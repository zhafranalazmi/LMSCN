import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Siswa from "@/models/Siswa";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const siswaList = await Siswa.find().select("-password").sort({ name: 1 });
  return NextResponse.json(siswaList);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, password, jurusan, kelas } = body;

  if (!name || !email || !password || !jurusan || !kelas) {
    return NextResponse.json(
      { message: "Semua field wajib diisi" },
      { status: 400 }
    );
  }

  await connectDB();

  const existing = await Siswa.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json(
      { message: "Email sudah dipakai" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const siswa = await Siswa.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    jurusan,
    kelas,
  });

  const { password: _pw, ...siswaWithoutPassword } = siswa.toObject();
  return NextResponse.json(siswaWithoutPassword, { status: 201 });
}
