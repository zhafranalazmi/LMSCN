import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Guru from "@/models/Guru";
import Siswa from "@/models/Siswa";
import Kepsek from "@/models/Kepsek";
import Kurikulum from "@/models/Kurikulum";
import SuperAdmin from "@/models/SuperAdmin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !["superadmin", "admin"].includes(role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const [superadmin, admin, guru, siswa, kepsek, kurikulum] = await Promise.all([
      SuperAdmin.countDocuments(),
      Admin.countDocuments(),
      Guru.countDocuments(),
      Siswa.countDocuments(),
      Kepsek.countDocuments(),
      Kurikulum.countDocuments(),
    ]);

    const total = superadmin + admin + guru + siswa + kepsek + kurikulum;

    return NextResponse.json({ superadmin, admin, guru, siswa, kepsek, kurikulum, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil data statistik" }, { status: 500 });
  }
}