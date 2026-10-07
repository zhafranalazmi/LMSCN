import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ExcelJS from "exceljs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { getPengajaranGuru } from "@/lib/pengajaranGuru";
import Guru from "@/models/Guru";
import Kelas from "@/models/Kelas";
import Mapel from "@/models/Mapel";
import Siswa from "@/models/Siswa";

export const runtime = "nodejs";

const FILTERS = ["semua", "kelas", "jurusan", "tingkat", "mapel", "siswa", "guru"];

function bacaPengajaranGuru(guru: unknown) {
  return getPengajaranGuru(
    guru as { pengajaran?: unknown; mapel?: string[]; kelasDiampu?: string[] }
  );
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== "kepsek" && role !== "kurikulum")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(req.url);
  if (searchParams.get("options") === "1") {
    const [siswa, guru, kelas, mapel] = await Promise.all([
      Siswa.find().select("_id name kelas jurusan").sort({ name: 1 }).lean(),
      Guru.find().select("_id name").sort({ name: 1 }).lean(),
      Kelas.find().select("nama tingkat jurusan").sort({ nama: 1 }).lean(),
      Mapel.find().select("nama").sort({ nama: 1 }).lean(),
    ]);

    return NextResponse.json({
      siswa: siswa.map(({ _id, name, kelas: namaKelas }) => ({
        id: String(_id),
        nama: name,
        kelas: namaKelas,
      })),
      guru: guru.map(({ _id, name }) => ({ id: String(_id), nama: name })),
      kelas: [...new Set([...kelas.map((item) => item.nama), ...siswa.map((item) => item.kelas)])].sort(),
      jurusan: [...new Set([...kelas.map((item) => item.jurusan), ...siswa.map((item) => item.jurusan)])].sort(),
      tingkat: [...new Set(kelas.map((item) => item.tingkat))].sort(),
      mapel: mapel.map((item) => item.nama),
    });
  }

  const entitas = searchParams.get("entitas");
  const filter = searchParams.get("filter") ?? "semua";
  const nilai = searchParams.get("nilai") ?? "";
  if (entitas !== "siswa" && entitas !== "guru") {
    return NextResponse.json({ message: "Jenis data tidak valid" }, { status: 400 });
  }
  if (!FILTERS.includes(filter) || (filter !== "semua" && !nilai)) {
    return NextResponse.json({ message: "Pilihan filter tidak valid" }, { status: 400 });
  }
  if ((entitas === "siswa" && filter === "guru") || (entitas === "guru" && filter === "siswa")) {
    return NextResponse.json({ message: "Pilihan filter tidak sesuai jenis data" }, { status: 400 });
  }

  let baris: Record<string, string>[];
  let headers: string[];

  if (entitas === "siswa") {
    const kelasMaster = await Kelas.find().select("nama tingkat").lean();
    const tingkatByKelas = new Map(kelasMaster.map((item) => [item.nama, item.tingkat]));
    let kelasMapel: Set<string> | undefined;
    let kelasTingkat: string[] | undefined;

    if (filter === "mapel") {
      const guruList = await Guru.find().select("mapel kelasDiampu pengajaran").lean();
      kelasMapel = new Set(
        guruList
          .filter((guru) => bacaPengajaranGuru(guru).some((item) => item.mapel === nilai))
          .flatMap((guru) => bacaPengajaranGuru(guru).filter((item) => item.mapel === nilai).flatMap((item) => item.kelas))
      );
    }
    if (filter === "tingkat") {
      kelasTingkat = kelasMaster.filter((item) => item.tingkat === nilai).map((item) => item.nama);
    }

    const query: Record<string, unknown> = {};
    if (filter === "kelas") query.kelas = nilai;
    if (filter === "jurusan") query.jurusan = nilai;
    if (filter === "siswa") query._id = nilai;
    if (kelasMapel) query.kelas = { $in: [...kelasMapel] };
    if (kelasTingkat) query.kelas = { $in: kelasTingkat };

    const siswaList = await Siswa.find(query).select("name email jurusan kelas").sort({ kelas: 1, name: 1 }).lean();
    const guruList = await Guru.find().select("mapel kelasDiampu pengajaran").lean();
    const mapelByKelas = new Map<string, Set<string>>();
    for (const guru of guruList) {
      for (const pengajaran of bacaPengajaranGuru(guru)) {
        for (const namaKelas of pengajaran.kelas) {
          if (!mapelByKelas.has(namaKelas)) mapelByKelas.set(namaKelas, new Set());
          mapelByKelas.get(namaKelas)!.add(pengajaran.mapel);
        }
      }
    }

    headers = ["Nama", "Email", "Jurusan", "Kelas", "Tingkat", "Mata Pelajaran"];
    baris = siswaList.map((siswa) => ({
      Nama: siswa.name,
      Email: siswa.email,
      Jurusan: siswa.jurusan,
      Kelas: siswa.kelas,
      Tingkat: tingkatByKelas.get(siswa.kelas) ?? "-",
      "Mata Pelajaran": [...(mapelByKelas.get(siswa.kelas) ?? [])].sort().join(", ") || "-",
    }));
  } else {
    const guruList = await Guru.find().select("_id name email mapel kelasDiampu pengajaran").sort({ name: 1 }).lean();
    let namaKelasTerpilih: Set<string> | undefined;

    if (filter === "tingkat" || filter === "jurusan") {
      const kelasQuery = filter === "tingkat" ? { tingkat: nilai } : { jurusan: nilai };
      const kelasList = await Kelas.find(kelasQuery).select("nama").lean();
      namaKelasTerpilih = new Set(kelasList.map((item) => item.nama));
    }

    const terfilter = guruList.filter((guru) => {
      const pengajaran = bacaPengajaranGuru(guru);
      if (filter === "guru") return String(guru._id) === nilai;
      if (filter === "mapel") return pengajaran.some((item) => item.mapel === nilai);
      if (filter === "kelas") return pengajaran.some((item) => item.kelas.includes(nilai));
      if (namaKelasTerpilih) return pengajaran.some((item) => item.kelas.some((nama) => namaKelasTerpilih!.has(nama)));
      return true;
    });

    headers = ["Nama", "Email", "Mata Pelajaran", "Kelas Diampu", "Pengajaran"];
    baris = terfilter.map((guru) => {
      const pengajaran = bacaPengajaranGuru(guru);
      return {
        Nama: guru.name,
        Email: guru.email,
        "Mata Pelajaran": [...new Set(pengajaran.map((item) => item.mapel))].sort().join(", ") || "-",
        "Kelas Diampu": [...new Set(pengajaran.flatMap((item) => item.kelas))].sort().join(", ") || "-",
        Pengajaran: pengajaran.map((item) => `${item.mapel}: ${item.kelas.join(", ")}`).join("; ") || "-",
      };
    });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(entitas === "siswa" ? "Data Siswa" : "Data Guru");
  worksheet.columns = headers.map((header) => ({ header, key: header, width: header === "Email" ? 34 : 28 }));
  worksheet.addRows(baris);
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3D6687" } };
  worksheet.getRow(1).alignment = { vertical: "middle", wrapText: true };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = `A1:${String.fromCharCode(64 + headers.length)}1`;

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="data-${entitas}-${filter}.xlsx"`,
    },
  });
}