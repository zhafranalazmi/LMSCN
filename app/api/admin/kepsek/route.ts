import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Kepsek from "@/models/Kepsek";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const list = await Kepsek.find().select("-password").sort({ name: 1 });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Nama, email, dan password wajib diisi" },
      { status: 400 }
    );
  }

  await connectDB();

  const existing = await Kepsek.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ message: "Email sudah dipakai" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const akun = await Kepsek.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  const { password: _pw, ...akunWithoutPassword } = akun.toObject();
  return NextResponse.json(akunWithoutPassword, { status: 201 });
}
