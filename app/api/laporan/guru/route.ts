import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Guru from "@/models/Guru";
import Tugas from "@/models/Tugas";
import Asesmen from "@/models/Asesmen";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== "kepsek" && role !== "kurikulum")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const guruList = await Guru.find().select("-password").sort({ name: 1 });

  const hasil = await Promise.all(
    guruList.map(async (g) => {
      const [jumlahTugas, jumlahAsesmen] = await Promise.all([
        Tugas.countDocuments({ guru: g._id }),
        Asesmen.countDocuments({ guru: g._id }),
      ]);
      return {
        _id: g._id,
        name: g.name,
        email: g.email,
        mapel: g.mapel,
        kelasDiampu: g.kelasDiampu,
        jumlahTugas,
        jumlahAsesmen,
      };
    })
  );

  return NextResponse.json(hasil);
}