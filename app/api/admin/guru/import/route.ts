import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { normalisasiPengajaranGuru } from "@/lib/pengajaranGuru";
import Guru from "@/models/Guru";
import Mapel from "@/models/Mapel";
import Kelas from "@/models/Kelas";

export const runtime = "nodejs";

function normalizeNama(nama: string) {
  return nama.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("id-ID");
}

function buatPetaNamaKanonis(namaList: string[]) {
  const peta = new Map<string, string | null>();
  for (const nama of namaList) {
    const namaBersih = nama.normalize("NFKC").trim().replace(/\s+/g, " ");
    const kunci = normalizeNama(namaBersih);
    if (kunci) peta.set(kunci, peta.has(kunci) ? null : namaBersih);
  }
  return peta;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Guru");
  worksheet.columns = [
    { header: "Nama", key: "name", width: 28 },
    { header: "Email", key: "email", width: 34 },
    { header: "Password", key: "password", width: 20 },
    { header: "Mapel", key: "mapel", width: 36 },
    { header: "Kelas Diampu", key: "kelasDiampu", width: 28 },
    { header: "Pengajaran", key: "pengajaran", width: 70 },
  ];
  worksheet.getCell("F1").note =
    "Format: Mapel: Kelas 1, Kelas 2; Mapel lain: Kelas 3. Kolom ini mengatur kelas untuk setiap mapel dan mengungguli kolom Mapel/Kelas Diampu.";
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3D6687" },
  };
  worksheet.getRow(1).alignment = { vertical: "middle", wrapText: true };
  worksheet.getRow(1).height = 30;
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = "A1:F1";

  const panduan = workbook.addWorksheet("Panduan");
  panduan.columns = [
    { header: "Bagian", key: "bagian", width: 30 },
    { header: "Petunjuk", key: "petunjuk", width: 90 },
  ];
  panduan.mergeCells("A1:B1");
  panduan.getCell("A1").value = "PANDUAN PENGISIAN DATA GURU";
  panduan.getCell("A1").font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  panduan.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3D6687" },
  };
  panduan.getCell("A1").alignment = { vertical: "middle" };
  panduan.getRow(1).height = 32;
  panduan.addRows([
    { bagian: "Kolom Pengajaran", petunjuk: "Tulis setiap mapel diikuti kelas yang diajar. Format: Mapel: Kelas 1, Kelas 2; Mapel lain: Kelas 3." },
    { bagian: "Contoh", petunjuk: "Matematika: X RPL 1, X RPL 2; Bahasa Inggris: XI RPL 1" },
    { bagian: "Pemisah mapel", petunjuk: "Gunakan titik koma (;) untuk memisahkan pasangan mapel." },
    { bagian: "Pemisah kelas", petunjuk: "Gunakan koma (,) untuk memisahkan beberapa kelas pada mapel yang sama." },
    { bagian: "Nama mapel dan kelas", petunjuk: "Nama harus cocok dengan data master Mata Pelajaran dan Manajemen Kelas di aplikasi." },
    { bagian: "Format lama", petunjuk: "Kolom Mapel dan Kelas Diampu lama masih didukung. Jika kolom Pengajaran diisi, kolom Pengajaran yang digunakan." },
    { bagian: "Kolom wajib", petunjuk: "Nama, Email, dan Password wajib diisi untuk setiap guru." },
  ]);
  panduan.getRow(2).font = { bold: true, color: { argb: "FF1D3345" } };
  panduan.getColumn(1).font = { bold: true, color: { argb: "FF1D3345" } };
  panduan.getColumn(1).eachCell((cell, rowNumber) => {
    if (rowNumber > 1) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEAF1F5" } };
  });
  panduan.eachRow((row) => {
    row.alignment = { vertical: "top", wrapText: true };
    if (row.number > 1) row.height = 34;
  });
  panduan.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template-data-guru.xlsx"',
    },
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "File Excel wajib diunggah" }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return NextResponse.json({ message: "File harus berformat .xlsx" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ message: "Ukuran file maksimal 5 MB" }, { status: 400 });
  }

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ message: "File Excel tidak dapat dibaca" }, { status: 400 });
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet || worksheet.rowCount < 2) {
    return NextResponse.json({ message: "File Excel belum berisi data guru" }, { status: 400 });
  }

  const headers = new Map<string, number>();
  worksheet.getRow(1).eachCell((cell, columnNumber) => {
    headers.set(cell.text.trim().toLowerCase().replace(/[^a-z0-9]/g, ""), columnNumber);
  });
  const nameColumn = headers.get("nama");
  const emailColumn = headers.get("email");
  const passwordColumn = headers.get("password");
  if (!nameColumn || !emailColumn || !passwordColumn) {
    return NextResponse.json(
      { message: "Header wajib: Nama, Email, dan Password. Unduh template untuk format yang benar." },
      { status: 400 }
    );
  }

  const mapelColumn = headers.get("mapel");
  const kelasColumn = headers.get("kelasdiampu");
  const pengajaranColumn = headers.get("pengajaran");
  const rows: {
    row: number;
    name: string;
    email: string;
    password: string;
    mapel: string[];
    kelasDiampu: string[];
    pengajaran: { mapel: string; kelas: string[] }[];
  }[] = [];
  const errors: { row: number; message: string }[] = [];
  const seenEmails = new Set<string>();

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const name = row.getCell(nameColumn).text.trim();
    const email = row.getCell(emailColumn).text.trim().toLowerCase();
    const password = row.getCell(passwordColumn).text.trim();
    const mapel = mapelColumn ? row.getCell(mapelColumn).text : "";
    const kelasDiampu = kelasColumn ? row.getCell(kelasColumn).text : "";
    const pengajaranText = pengajaranColumn ? row.getCell(pengajaranColumn).text.trim() : "";

    if (!name && !email && !password) continue;
    if (!name || !email || !password) {
      errors.push({ row: rowNumber, message: "Nama, email, dan password wajib diisi" });
      continue;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ row: rowNumber, message: "Format email tidak valid" });
      continue;
    }
    if (seenEmails.has(email)) {
      errors.push({ row: rowNumber, message: "Email duplikat di dalam file" });
      continue;
    }
    seenEmails.add(email);
    const splitList = (value: string) =>
      value.split(/[;,\n]+/).map((item) => item.trim()).filter(Boolean);
    const pengajaran: { mapel: string; kelas: string[] }[] = [];
    let formatPengajaranValid = true;
    for (const pasangan of pengajaranText.split(/[;\n]+/).map((item) => item.trim()).filter(Boolean)) {
      const pemisah = pasangan.indexOf(":");
      const namaMapel = pemisah >= 0 ? pasangan.slice(0, pemisah).trim() : "";
      const daftarKelas = pemisah >= 0 ? splitList(pasangan.slice(pemisah + 1)) : [];
      if (!namaMapel || daftarKelas.length === 0) {
        errors.push({
          row: rowNumber,
          message: `Format Pengajaran tidak valid: "${pasangan}". Gunakan format Mapel: Kelas 1, Kelas 2`,
        });
        formatPengajaranValid = false;
        break;
      }
      pengajaran.push({ mapel: namaMapel, kelas: daftarKelas });
    }
    if (!formatPengajaranValid) continue;
    rows.push({
      row: rowNumber,
      name,
      email,
      password,
      mapel: splitList(mapel),
      kelasDiampu: splitList(kelasDiampu),
      pengajaran,
    });
  }

  await connectDB();
  const [mapelMaster, kelasMaster] = await Promise.all([
    Mapel.find().select("nama").lean(),
    Kelas.find().select("nama").lean(),
  ]);
  const petaMapel = buatPetaNamaKanonis(mapelMaster.map((item) => item.nama));
  const petaKelas = buatPetaNamaKanonis(kelasMaster.map((item) => item.nama));
  const rowsValid: typeof rows = [];

  for (const row of rows) {
    const pesan: string[] = [];
    const cocokkanNama = (namaList: string[], peta: Map<string, string | null>, jenis: string) => {
      const hasil = new Set<string>();
      for (const nama of namaList) {
        const kunci = normalizeNama(nama);
        if (!peta.has(kunci)) {
          pesan.push(`${jenis} "${nama}" tidak ada di data master`);
        } else {
          const namaKanonis = peta.get(kunci);
          if (namaKanonis === null) {
            pesan.push(`${jenis} "${nama}" memiliki data master duplikat`);
          } else if (namaKanonis) {
            hasil.add(namaKanonis);
          }
        }
      }
      return [...hasil];
    };

    const pengajaranKanonis = row.pengajaran.length
      ? row.pengajaran.map((item) => ({
          mapel: cocokkanNama([item.mapel], petaMapel, "Mapel")[0] ?? "",
          kelas: cocokkanNama(item.kelas, petaKelas, "Kelas"),
        }))
      : cocokkanNama(row.mapel, petaMapel, "Mapel").map((namaMapel) => ({
          mapel: namaMapel,
          kelas: cocokkanNama(row.kelasDiampu, petaKelas, "Kelas"),
        }));
    if (pesan.length > 0) {
      errors.push({ row: row.row, message: pesan.join("; ") });
      continue;
    }
    const pengajaran = normalisasiPengajaranGuru(pengajaranKanonis);
    rowsValid.push({
      ...row,
      mapel: [...new Set(pengajaran.map((item) => item.mapel))],
      kelasDiampu: [...new Set(pengajaran.flatMap((item) => item.kelas))],
      pengajaran,
    });
  }

  if (rowsValid.length === 0) {
    return NextResponse.json(
      { message: "Tidak ada baris valid untuk diimpor", errors },
      { status: 400 }
    );
  }

  const existing = await Guru.find({ email: { $in: rowsValid.map((row) => row.email) } })
    .select("email")
    .lean();
  const existingEmails = new Set(existing.map((guru) => guru.email));
  let imported = 0;

  for (const row of rowsValid) {
    if (existingEmails.has(row.email)) {
      errors.push({ row: row.row, message: "Email sudah dipakai" });
      continue;
    }

    try {
      await Guru.create({
        name: row.name,
        email: row.email,
        password: await bcrypt.hash(row.password, 10),
        mapel: row.mapel,
        kelasDiampu: row.kelasDiampu,
        pengajaran: row.pengajaran,
      });
      imported += 1;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        errors.push({ row: row.row, message: "Email sudah dipakai" });
      } else {
        errors.push({ row: row.row, message: "Gagal menyimpan data guru" });
      }
    }
  }

  return NextResponse.json({ imported, errors });
}