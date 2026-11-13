import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ExcelJS from "exceljs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Asesmen from "@/models/Asesmen";
import JawabanSiswa from "@/models/JawabanSiswa";
import Tugas from "@/models/Tugas";
import PengumpulanTugas from "@/models/PengumpulanTugas";
import Guru from "@/models/Guru";
import Kelas from "@/models/Kelas";
import Siswa from "@/models/Siswa";

const FILTERS = ["semua", "kelas"];

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== "kepsek" && role !== "kurikulum")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "semua";
  const nilaiFilter = searchParams.get("nilai") ?? "";
  const format = searchParams.get("format");
  if (!FILTERS.includes(filter) || (filter !== "semua" && !nilaiFilter)) {
    return NextResponse.json({ message: "Pilihan filter tidak valid" }, { status: 400 });
  }
  await connectDB();

  const aktivitasQuery: Record<string, unknown> = filter === "kelas"
    ? { kelas: nilaiFilter }
    : {};

  const [asesmenList, tugasList] = await Promise.all([
    Asesmen.find(aktivitasQuery).select("judul mapel kelas guru").lean(),
    Tugas.find(aktivitasQuery).select("judul mapel kelas guru").lean(),
  ]);
  const asesmenIds = asesmenList.map((item) => item._id);
  const tugasIds = tugasList.map((item) => item._id);
  const [jawabanList, pengumpulanList] = await Promise.all([
    JawabanSiswa.find({ asesmen: { $in: asesmenIds } }).populate("siswa", "name email jurusan kelas"),
    PengumpulanTugas.find({ tugas: { $in: tugasIds } }).populate("siswa", "name email jurusan kelas"),
  ]);

  const aktivitasById = new Map<string, { judul: string; mapel: string; kelas: string; guru: string }>();
  for (const item of [...asesmenList, ...tugasList]) {
    aktivitasById.set(String(item._id), {
      judul: item.judul,
      mapel: item.mapel,
      kelas: item.kelas,
      guru: String(item.guru),
    });
  }
  const guruIds = [...new Set([...aktivitasById.values()].map((item) => item.guru))];
  const [guruList, kelasList] = await Promise.all([
    Guru.find({ _id: { $in: guruIds } }).select("name").lean(),
    Kelas.find().select("nama tingkat").lean(),
  ]);
  const guruById = new Map(guruList.map((item) => [String(item._id), item.name]));
  const tingkatByKelas = new Map(kelasList.map((item) => [item.nama, item.tingkat]));

  const buatBaris = (record: any, activityId: string, jenis: "Asesmen" | "Tugas", nilai: number | null) => {
    const siswa = record.siswa;
    const aktivitas = aktivitasById.get(activityId);
    const kelas = siswa?.kelas ?? aktivitas?.kelas ?? "-";
    return {
      siswaName: siswa?.name ?? "-",
      siswaEmail: siswa?.email ?? "-",
      siswaJurusan: siswa?.jurusan ?? "-",
      siswaKelas: kelas,
      tingkat: tingkatByKelas.get(kelas) ?? "-",
      guruName: guruById.get(aktivitas?.guru ?? "") ?? "-",
      mapel: aktivitas?.mapel ?? "-",
      jenis,
      judul: aktivitas?.judul ?? "-",
      nilai,
      status: record.status,
    };
  };

  const hasil = [
    ...jawabanList.map((item) => buatBaris(item, String(item.asesmen), "Asesmen", item.nilaiTotal)),
    ...pengumpulanList.map((item) => buatBaris(item, String(item.tugas), "Tugas", item.nilai)),
  ];
  if (format !== "xlsx") return NextResponse.json(hasil);

  const headers = ["Nama Siswa", "Email", "Jurusan", "Kelas", "Tingkat", "Guru", "Mata Pelajaran", "Jenis", "Judul", "Nilai", "Status"];
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Rekap Nilai");
  worksheet.columns = headers.map((header) => ({ header, key: header, width: header === "Email" ? 32 : 22 }));
  worksheet.addRows(hasil.map((item) => ({
    "Nama Siswa": item.siswaName,
    Email: item.siswaEmail,
    Jurusan: item.siswaJurusan,
    Kelas: item.siswaKelas,
    Tingkat: item.tingkat,
    Guru: item.guruName,
    "Mata Pelajaran": item.mapel,
    Jenis: item.jenis,
    Judul: item.judul,
    Nilai: item.nilai ?? "-",
    Status: item.status,
  })));
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3D6687" } };
  worksheet.getRow(1).alignment = { vertical: "middle", wrapText: true };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = "A1:K1";

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="rekap-nilai-${filter}.xlsx"`,
    },
  });
}