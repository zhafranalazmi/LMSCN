import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ExcelJS from "exceljs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Asesmen from "@/models/Asesmen";
import JawabanSiswa from "@/models/JawabanSiswa";
import Tugas from "@/models/Tugas";
import PengumpulanTugas from "@/models/PengumpulanTugas";
import Siswa from "@/models/Siswa";
import Guru from "@/models/Guru";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mapel = searchParams.get("mapel");
  const kelas = searchParams.get("kelas");

  if (!mapel || !kelas) {
    return NextResponse.json({ message: "Parameter mapel dan kelas wajib diisi" }, { status: 400 });
  }

  await connectDB();

  const guru = await Guru.findById((session.user as any).id)
    .select("mapel kelasDiampu")
    .lean<{ mapel: string[]; kelasDiampu: string[] }>();
  if (!guru?.mapel?.includes(mapel) || !guru?.kelasDiampu?.includes(kelas)) {
    return NextResponse.json({ message: "Kamu tidak di-assign ke mapel atau kelas ini" }, { status: 403 });
  }

  const asesmenList = await Asesmen.find({ mapel, kelas }).select("judul soal");
  const tugasList = await Tugas.find({
    guru: (session.user as any).id,
    mapel,
    kelas,
  }).select("judul");
  const asesmenIds = asesmenList.map((a) => a._id);
  const tugasIds = tugasList.map((t) => t._id);
  const [jawabanList, pengumpulanList, daftarSiswa] = await Promise.all([
    JawabanSiswa.find({ asesmen: { $in: asesmenIds } }).populate("siswa", "name email"),
    PengumpulanTugas.find({ tugas: { $in: tugasIds } }).populate("siswa", "name email"),
    Siswa.find({ kelas }).select("name email").sort({ name: 1 }).lean(),
  ]);

  const siswaMap = new Map<
    string,
    {
      siswa: { name: string; email: string };
      nilai: Record<string, { nilaiTotal: number | null; status: string; pengumpulanId?: string } | null>;
    }
  >();

  for (const siswa of daftarSiswa) {
    siswaMap.set(String(siswa._id), {
      siswa: { name: siswa.name, email: siswa.email },
      nilai: {},
    });
  }

  for (const jawaban of jawabanList) {
    const siswa = jawaban.siswa as any;
    if (!siswa?._id) continue;
    const siswaId = siswa._id.toString();
    if (!siswaMap.has(siswaId)) {
      siswaMap.set(siswaId, {
        siswa: { name: siswa.name, email: siswa.email },
        nilai: {},
      });
    }
    siswaMap.get(siswaId)!.nilai[`asesmen:${jawaban.asesmen.toString()}`] = {
      nilaiTotal: jawaban.nilaiTotal ?? null,
      status: jawaban.status,
    };
  }

  for (const pengumpulan of pengumpulanList) {
    const siswa = pengumpulan.siswa as any;
    if (!siswa?._id) continue;
    const siswaId = siswa._id.toString();
    if (!siswaMap.has(siswaId)) {
      siswaMap.set(siswaId, {
        siswa: { name: siswa.name, email: siswa.email },
        nilai: {},
      });
    }
    siswaMap.get(siswaId)!.nilai[`tugas:${pengumpulan.tugas.toString()}`] = {
      nilaiTotal: pengumpulan.nilai ?? null,
      status: pengumpulan.status,
      pengumpulanId: pengumpulan._id.toString(),
    };
  }

  const rekap = Array.from(siswaMap.values());
  const asesmenColumns = asesmenList.map((item) => ({
    key: `asesmen:${item._id.toString()}`,
    title: item.judul,
    kind: "Asesmen",
  }));
  const tugasColumns = tugasList.map((item) => ({
    key: `tugas:${item._id.toString()}`,
    title: item.judul,
    kind: "Tugas",
  }));
  const columns = [...asesmenColumns, ...tugasColumns];

  if (searchParams.get("format") === "excel") {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rekap Nilai");
    worksheet.columns = [
      { header: "Nama Siswa", key: "nama", width: 28 },
      { header: "Email", key: "email", width: 34 },
      ...columns.flatMap((column, index) => [
        { header: `${column.kind}: ${column.title}`, key: `nilai_${index}`, width: 24 },
        { header: `Status ${column.kind}: ${column.title}`, key: `status_${index}`, width: 22 },
      ]),
      { header: "Rata-rata", key: "rataRata", width: 14 },
    ];

    for (const row of rekap) {
      const excelRow: Record<string, string | number | null> = {
        nama: row.siswa.name,
        email: row.siswa.email,
      };
      const nilaiValid: number[] = [];
      columns.forEach((column, index) => {
        const nilai = row.nilai[column.key];
        const score = nilai?.nilaiTotal ?? null;
        excelRow[`nilai_${index}`] = score;
        excelRow[`status_${index}`] = nilai?.status ?? "Belum mengumpulkan";
        if (score !== null) nilaiValid.push(score);
      });
      excelRow.rataRata = nilaiValid.length
        ? Math.round((nilaiValid.reduce((sum, score) => sum + score, 0) / nilaiValid.length) * 10) / 10
        : null;
      worksheet.addRow(excelRow);
    }

    const header = worksheet.getRow(1);
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3D6687" },
    };
    header.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    header.height = 34;
    worksheet.views = [{ state: "frozen", xSplit: 2, ySplit: 1 }];
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: worksheet.columnCount },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const namaFile = `Rekap_Nilai_${mapel}_${kelas}`.replace(/[^\w-]+/g, "_") + ".xlsx";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${namaFile}"`,
      },
    });
  }

  return NextResponse.json({
    asesmenList: asesmenList.map((a) => ({ _id: a._id, judul: a.judul })),
    tugasList: tugasList.map((t) => ({ _id: t._id, judul: t.judul })),
    rekap,
  });
}