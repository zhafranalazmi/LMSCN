import { connectDB } from "@/lib/mongodb";
import UploadedFile from "@/models/UploadedFile";

export function getUploadedFilePublicId(url: string) {
  const match = /^\/api\/files\/([^/?#]+)$/.exec(url);
  if (!match) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export async function registerUploadedFile(
  publicId: string,
  userId: string,
  role: "guru" | "siswa"
) {
  await connectDB();
  await UploadedFile.create({ publicId, uploadedBy: userId, role });
}

export async function uploadedFileBelongsTo(
  url: string,
  userId: string,
  role: "guru" | "siswa"
) {
  const publicId = getUploadedFilePublicId(url);
  if (!publicId) {
    return false;
  }

  await connectDB();
  return Boolean(
    await UploadedFile.exists({ publicId, uploadedBy: userId, role })
  );
}
