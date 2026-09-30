import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Kelas from "@/models/Kelas";
import Siswa from "@/models/Siswa";

export const runtime = "nodejs";

function normalizeNama(nama: string) {
  return nama.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("id-ID");
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Siswa");
  worksheet.columns = [
    { header: "Nama", key: "name", width: 28 },
    { header: "Email", key: "email", width: 34 },
    { header: "Password", key: "password", width: 20 },
    { header: "Jurusan", key: "jurusan", width: 20 },
    { header: "Tingkat Kelas", key: "tingkat", width: 18 },
    { header: "Nomor Urut Kelas", key: "nomorUrutKelas", width: 22 },
  ];
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3D6687" },
  };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = "A1:F1";

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template-data-siswa.xlsx"',
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
    return NextResponse.json({ message: "File Excel belum berisi data siswa" }, { status: 400 });
  }

  const headers = new Map<string, number>();
  worksheet.getRow(1).eachCell((cell, columnNumber) => {
    headers.set(cell.text.trim().toLowerCase().replace(/[^a-z0-9]/g, ""), columnNumber);
  });
  const nameColumn = headers.get("nama");
  const emailColumn = headers.get("email");
  const passwordColumn = headers.get("password");
  const jurusanColumn = headers.get("jurusan");
  const tingkatColumn = headers.get("tingkatkelas");
  const nomorKelasColumn = headers.get("nomorurutkelas");
  if (!nameColumn || !emailColumn || !passwordColumn || !jurusanColumn || !tingkatColumn || !nomorKelasColumn) {
    return NextResponse.json(
      { message: "Header wajib: Nama, Email, Password, Jurusan, Tingkat Kelas, dan Nomor Urut Kelas. Unduh template untuk format yang benar." },
      { status: 400 }
    );
  }

  const rows: {
    row: number;
    name: string;
    email: string;
    password: string;
    jurusan: string;
    tingkat: string;
    nomorUrutKelas: number;
  }[] = [];
  const errors: { row: number; message: string }[] = [];
  const seenEmails = new Set<string>();

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const name = row.getCell(nameColumn).text.trim();
    const email = row.getCell(emailColumn).text.trim().toLowerCase();
    const password = row.getCell(passwordColumn).text.trim();
    const jurusan = row.getCell(jurusanColumn).text.trim();
    const tingkat = row.getCell(tingkatColumn).text.trim();
    const nomorUrutKelas = row.getCell(nomorKelasColumn).text.trim();

    if (![name, email, password, jurusan, tingkat, nomorUrutKelas].some(Boolean)) continue;
    if (!name || !email || !password || !jurusan || !tingkat || !nomorUrutKelas) {
      errors.push({ row: rowNumber, message: "Semua kolom wajib diisi" });
      continue;
    }
    const nomorKelas = Number(nomorUrutKelas);
    if (!Number.isInteger(nomorKelas) || nomorKelas < 1) {
      errors.push({ row: rowNumber, message: "Nomor urut kelas harus berupa angka bulat positif" });
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
    rows.push({ row: rowNumber, name, email, password, jurusan, tingkat, nomorUrutKelas: nomorKelas });
  }

  await connectDB();
  const kelasMaster = await Kelas.find().select("nama tingkat jurusan").lean();

  const validRows: Array<(typeof rows)[number] & { kelas: string }> = [];
  for (const row of rows) {
    const matchingKelas = kelasMaster.filter((item) => {
      const nomorKelasMaster = Number(item.nama.trim().split(/\s+/).at(-1));
      return (
        normalizeNama(item.tingkat) === normalizeNama(row.tingkat) &&
        normalizeNama(item.jurusan) === normalizeNama(row.jurusan) &&
        nomorKelasMaster === row.nomorUrutKelas
      );
    });
    if (matchingKelas.length === 0) {
      errors.push({
        row: row.row,
        message: `Kelas ${row.tingkat} ${row.jurusan} ${row.nomorUrutKelas} tidak ada di data master`,
      });
      continue;
    }
    if (matchingKelas.length > 1) {
      errors.push({ row: row.row, message: "Kombinasi tingkat, jurusan, dan nomor kelas memiliki data master duplikat" });
      continue;
    }
    const kelasMasterItem = matchingKelas[0];
    validRows.push({ ...row, kelas: kelasMasterItem.nama, jurusan: kelasMasterItem.jurusan });
  }

  if (validRows.length === 0) {
    return NextResponse.json(
      { message: "Tidak ada baris valid untuk diimpor", errors },
      { status: 400 }
    );
  }

  const existing = await Siswa.find({ email: { $in: validRows.map((row) => row.email) } })
    .select("email")
    .lean();
  const existingEmails = new Set(existing.map((siswa) => siswa.email));
  let imported = 0;

  for (const row of validRows) {
    if (existingEmails.has(row.email)) {
      errors.push({ row: row.row, message: "Email sudah dipakai" });
      continue;
    }

    try {
      await Siswa.create({
        name: row.name,
        email: row.email,
        password: await bcrypt.hash(row.password, 10),
        jurusan: row.jurusan,
        kelas: row.kelas,
      });
      imported += 1;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        errors.push({ row: row.row, message: "Email sudah dipakai" });
      } else {
        errors.push({ row: row.row, message: "Gagal menyimpan data siswa" });
      }
    }
  }

  return NextResponse.json({ imported, errors });
}