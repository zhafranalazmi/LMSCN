import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
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
  ];
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3D6687" },
  };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = "A1:E1";

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
  const rows: {
    row: number;
    name: string;
    email: string;
    password: string;
    mapel: string[];
    kelasDiampu: string[];
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

    if (![name, email, password, mapel, kelasDiampu].some((value) => value.trim())) continue;
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
    rows.push({
      row: rowNumber,
      name,
      email,
      password,
      mapel: splitList(mapel),
      kelasDiampu: splitList(kelasDiampu),
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

    const mapelKanonis = cocokkanNama(row.mapel, petaMapel, "Mapel");
    const kelasKanonis = cocokkanNama(row.kelasDiampu, petaKelas, "Kelas");
    if (pesan.length > 0) {
      errors.push({ row: row.row, message: pesan.join("; ") });
      continue;
    }
    rowsValid.push({ ...row, mapel: mapelKanonis, kelasDiampu: kelasKanonis });
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