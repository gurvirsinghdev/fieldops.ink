import { getServerSession } from "@/lib/auth/helpers";
import { uploadWorkspaceImage } from "@/lib/integrations/cloudinary";
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
    return Response.json(
      { error: "File must be under 2MB." },
      { status: 400 },
    );
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspace: { select: { id: true } } },
  });

  if (!membership) {
    return Response.json({ error: "Not a member of this workspace" }, { status: 403 });
  }

  try {
    const imageUrl = await uploadWorkspaceImage(file);

    const updated = await prisma.workspace.update({
      where: { id: membership.workspace.id },
      data: { image: imageUrl },
      select: { name: true, slug: true, plan: true, image: true },
    });

    return Response.json({ workspace: updated });
  } catch (err) {
    console.error(
      "Workspace image upload failed for user %s:",
      session.user.id,
      err,
    );
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
