import { randomUUID } from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET"
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

export async function uploadPdfToCloudinary(buffer: Buffer, fileName: string) {
  const client = configureCloudinary();
  const safeFileName =
    fileName
      .replace(/[\\/]+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/^\.+/, "")
      .slice(0, 120) || "file.pdf";
  const pdfFileName = safeFileName.toLowerCase().endsWith(".pdf")
    ? safeFileName
    : `${safeFileName}.pdf`;
  const publicId = `${randomUUID()}-${pdfFileName}`;

  const result = await new Promise<{ public_id: string }>((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        resource_type: "raw",
        type: "authenticated",
        public_id: publicId,
      },
      (error, response) => {
        if (error) {
          reject(error);
        } else if (!response?.public_id) {
          reject(new Error("Cloudinary tidak mengembalikan ID file"));
        } else {
          resolve({ public_id: response.public_id });
        }
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });

  return result;
}

export function createCloudinaryPdfDownloadUrl(publicId: string) {
  const client = configureCloudinary();

  return client.utils.private_download_url(publicId, "pdf", {
    resource_type: "raw",
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 5 * 60,
  });
}
