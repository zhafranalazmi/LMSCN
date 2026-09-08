import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Guru from "@/models/Guru";
import Siswa from "@/models/Siswa";
import Kepsek from "@/models/Kepsek";
import Kurikulum from "@/models/Kurikulum";

export async function GET() {
  try {
    await connectDB();

    const [admin, guru, siswa, kepsek, kurikulum] = await Promise.all([
      Admin.countDocuments(),
      Guru.countDocuments(),
      Siswa.countDocuments(),
      Kepsek.countDocuments(),
      Kurikulum.countDocuments(),
    ]);

    const total = admin + guru + siswa + kepsek + kurikulum;

    return NextResponse.json({ admin, guru, siswa, kepsek, kurikulum, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil data statistik" }, { status: 500 });
  }
}