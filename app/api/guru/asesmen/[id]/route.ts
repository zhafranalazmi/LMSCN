import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Asesmen from "@/models/Asesmen";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const asesmen = await Asesmen.findById(params.id);

  if (!asesmen || asesmen.guru.toString() !== (session.user as any).id) {
    return NextResponse.json({ message: "Asesmen tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(asesmen);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const asesmen = await Asesmen.findById(params.id);
  if (!asesmen) {
    return NextResponse.json({ message: "Asesmen tidak ditemukan" }, { status: 404 });
  }
  if (asesmen.guru.toString() !== (session.user as any).id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await Asesmen.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Asesmen dihapus" });
}