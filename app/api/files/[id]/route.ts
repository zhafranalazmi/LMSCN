import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { createCloudinaryPdfDownloadUrl } from "@/lib/cloudinary";
import { getStoredFile } from "@/lib/gridfs";
import { connectDB } from "@/lib/mongodb";
import Materi from "@/models/Materi";
import PengumpulanTugas from "@/models/PengumpulanTugas";
import Siswa from "@/models/Siswa";
import Tugas from "@/models/Tugas";

export const runtime = "nodejs";

async function checkFileAccess(userId: string, role: string, fileUrl: string) {
  await connectDB();

  const [materi, tugas, pengumpulan] = await Promise.all([
    Materi.find({ lampiranUrl: fileUrl }).select("kelas guru").lean(),
    Tugas.find({ lampiranUrl: fileUrl }).select("kelas guru").lean(),
    PengumpulanTugas.find({ lampiranUrl: fileUrl })
      .select("tugas siswa")
      .lean(),
  ]);
  const exists =
    materi.length > 0 || tugas.length > 0 || pengumpulan.length > 0;

  if (!exists) {
    return { exists: false, allowed: false };
  }

  if (role === "admin") {
    return { exists: true, allowed: true };
  }

  if (role === "siswa") {
    const siswa = await Siswa.findById(userId).select("kelas");
    const allowed =
      !!siswa &&
      (materi.some((file) => file.kelas === siswa.kelas) ||
        tugas.some((file) => file.kelas === siswa.kelas) ||
        pengumpulan.some((file) => String(file.siswa) === userId));

    return { exists: true, allowed };
  }

  if (role === "guru") {
    const materiMilikGuru = materi.some(
      (file) => String(file.guru) === userId
    );
    const tugasMilikGuru = tugas.filter(
      (file) => String(file.guru) === userId
    );
    const tugasPengumpulan = await Tugas.exists({
      _id: { $in: pengumpulan.map((file) => file.tugas) },
      guru: userId,
    });

    return {
      exists: true,
      allowed: materiMilikGuru || tugasMilikGuru.length > 0 || !!tugasPengumpulan,
    };
  }

  return { exists: true, allowed: false };
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const cloudinaryPublicId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[A-Za-z0-9_.-]+\.pdf$/i;
  const fileUrl = `/api/files/${encodeURIComponent(params.id)}`;
  if (cloudinaryPublicId.test(params.id)) {
    const access = await checkFileAccess(
      session.user.id,
      session.user.role,
      fileUrl
    );
    if (!access.exists) {
      return NextResponse.json({ message: "File tidak ditemukan" }, { status: 404 });
    }
    if (!access.allowed) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    try {
      return NextResponse.redirect(createCloudinaryPdfDownloadUrl(params.id));
    } catch (error) {
      console.error("Gagal membuat tautan unduhan Cloudinary:", error);
      return NextResponse.json(
        { message: "Gagal membuat tautan unduhan file" },
        { status: 500 }
      );
    }
  }

  const file = await getStoredFile(params.id);
  if (!file) {
    return NextResponse.json({ message: "File tidak ditemukan" }, { status: 404 });
  }

  const access = await checkFileAccess(
    session.user.id,
    session.user.role,
    fileUrl
  );
  const uploadedBy = file.metadata?.uploadedBy;
  const uploadedRole = file.metadata?.role;
  const isUploader =
    typeof uploadedBy === "string" &&
    uploadedBy === session.user.id &&
    uploadedRole === session.user.role;
  if (access.exists ? !access.allowed : session.user.role !== "admin" && !isUploader) {
    return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
  }

  const db = mongoose.connection.db;
  if (!db) {
    return NextResponse.json({ message: "Database tidak tersedia" }, { status: 500 });
  }

  const fileId = new mongoose.Types.ObjectId(String(file._id));

  const downloadStream = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "uploads",
  }).openDownloadStream(fileId);
  const fallbackFilename = file.filename.replace(/[^\x20-\x7E]|["\\]/g, "_");
  const encodedFilename = encodeURIComponent(file.filename).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );

  return new NextResponse(downloadStream as any, {
    headers: {
      "Content-Type": file.metadata?.contentType ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${fallbackFilename}"; filename*=UTF-8''${encodedFilename}`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}