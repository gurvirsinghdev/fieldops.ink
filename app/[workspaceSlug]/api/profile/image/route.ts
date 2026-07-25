import { getServerSession } from "@/lib/auth/helpers";
import { uploadProfileImage } from "@/lib/integrations/cloudinary";
import prisma from "@/lib/db/prisma";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { error: "Invalid file type. Allowed: PNG, JPEG, WebP, GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: "File must be under 2MB." }, { status: 400 });
  }

  try {
    const imageUrl = await uploadProfileImage(file);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
      select: { id: true, name: true, email: true, image: true },
    });

    return Response.json(updatedUser);
  } catch (err) {
    console.error(
      "Profile image upload/update failed for user %s:",
      session.user.id,
      err,
    );
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
