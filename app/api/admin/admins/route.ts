import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string } | undefined)?.role !== "superadmin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const list = await Admin.find().select("-password").sort({ name: 1 });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string } | undefined)?.role !== "superadmin") {
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

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ message: "Email sudah dipakai" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const akun = await Admin.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  const { password: _pw, ...akunWithoutPassword } = akun.toObject();
  return NextResponse.json(akunWithoutPassword, { status: 201 });
}
