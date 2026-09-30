import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ExcelJS from "exceljs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Asesmen from "@/models/Asesmen";
import JawabanSiswa from "@/models/JawabanSiswa";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "guru") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const asesmen = await Asesmen.findById(params.id).lean<any>();
  if (!asesmen || asesmen.guru.toString() !== (session.user as any).id) {
    return NextResponse.json({ message: "Asesmen tidak ditemukan" }, { status: 404 });
  }

  // SESUAIKAN: nama field relasi siswa di JawabanSiswa (di sini diasumsikan "siswa")
  const daftar = await JawabanSiswa.find({ asesmen: params.id })
    .populate("siswa")
    .sort({ createdAt: 1 })
    .lean<any[]>();

  const totalPoin = asesmen.soal.reduce(
    (sum: number, s: any) => sum + (s.poin ?? 0),
    0
  );

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Nilai");

  ws.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Nama Siswa", key: "nama", width: 30 },
    { header: "Kelas", key: "kelas", width: 12 },
    ...asesmen.soal.map((s: any, i: number) => ({
      header: `Soal ${i + 1} (${s.tipe === "esai" ? "Esai" : "PG"}, maks ${s.poin})`,
      key: `s${i}`,
      width: 14,
    })),
    { header: "Nilai Total", key: "total", width: 12 },
    { header: "Maks Poin", key: "maks", width: 11 },
    { header: "Persen (%)", key: "persen", width: 11 },
    { header: "Status", key: "status", width: 16 },
  ];

  daftar.forEach((j, i) => {
    const row: Record<string, any> = {
      no: i + 1,
      nama: j.siswa?.nama ?? j.siswa?.name ?? "-", // SESUAIKAN
      kelas: asesmen.kelas,
      total: j.nilaiTotal ?? 0,
      maks: totalPoin,
      persen: totalPoin > 0 ? Math.round(((j.nilaiTotal ?? 0) / totalPoin) * 10000) / 100 : 0,
      status: j.status ?? "-",
    };

    asesmen.soal.forEach((s: any, idx: number) => {
      const item = j.jawaban?.find(
        (x: any) => x.soalId?.toString() === s._id.toString()
      );
      // Esai yang belum dinilai dibiarkan kosong
      row[`s${idx}`] = item?.poinDiperoleh ?? null;
    });

    ws.addRow(row);
  });

  // Styling header
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3D6687" },
  };
  header.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  header.height = 32;
  ws.views = [{ state: "frozen", xSplit: 2, ySplit: 1 }];

  const buffer = await wb.xlsx.writeBuffer();
  const namaFile =
    `Nilai_${asesmen.judul}_${asesmen.kelas}`.replace(/[^\w\-]+/g, "_") + ".xlsx";

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${namaFile}"`,
    },
  });
}