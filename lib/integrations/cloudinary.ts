import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadProfileImage(file: File): Promise<string> {
  return uploadImage(file, "profile-images");
}

export async function uploadWorkspaceImage(file: File): Promise<string> {
  return uploadImage(file, "workspace-images");
}

async function uploadImage(file: File, folder: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<{ secure_url: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) reject(error);
          else if (!result)
            reject(new Error("Cloudinary upload returned no result"));
          else resolve(result);
        },
      );
      uploadStream.end(buffer);
    },
  );

  return result.secure_url;
}
