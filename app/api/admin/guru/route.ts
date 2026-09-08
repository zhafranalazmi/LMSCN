import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Guru from "@/models/Guru";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const guruList = await Guru.find().select("-password").sort({ name: 1 });
  return NextResponse.json(guruList);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, password, mapel, kelasDiampu } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Nama, email, dan password wajib diisi" },
      { status: 400 }
    );
  }

  await connectDB();

  const existingEmail = await Guru.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    return NextResponse.json({ message: "Email sudah dipakai" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const guru = await Guru.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    mapel: Array.isArray(mapel) ? mapel : [],
    kelasDiampu: Array.isArray(kelasDiampu) ? kelasDiampu : [],
  });

  const { password: _pw, ...guruWithoutPassword } = guru.toObject();
  return NextResponse.json(guruWithoutPassword, { status: 201 });
}