import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Mapel from "@/models/Mapel";

function normalizeNama(nama: string) {
  return nama.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("id-ID");
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const mapelList = await Mapel.find().sort({ nama: 1 });
  return NextResponse.json(mapelList);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { nama } = body;

  if (!nama || !nama.trim()) {
    return NextResponse.json({ message: "Nama mapel wajib diisi" }, { status: 400 });
  }

  await connectDB();

  const namaBersih = nama.normalize("NFKC").trim().replace(/\s+/g, " ");
  const existingNames = await Mapel.find().select("nama").lean();
  if (existingNames.some((item) => normalizeNama(item.nama) === normalizeNama(namaBersih))) {
    return NextResponse.json(
      { message: "Mapel sudah ada dengan penulisan yang sama" },
      { status: 400 }
    );
  }

  const mapel = await Mapel.create({ nama: namaBersih });
  return NextResponse.json(mapel, { status: 201 });
}
