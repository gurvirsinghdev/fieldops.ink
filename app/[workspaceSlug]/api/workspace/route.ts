import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MIN_LENGTH = 3;

function isValidSlug(slug: string) {
  return slug.length >= SLUG_MIN_LENGTH && SLUG_REGEX.test(slug);
}

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checkSlug = request.nextUrl.searchParams.get("checkSlug");
  if (!checkSlug) {
    return Response.json({ error: "Missing checkSlug query parameter" }, { status: 400 });
  }

  if (!isValidSlug(checkSlug)) {
    return Response.json({ error: "Invalid slug format" }, { status: 400 });
  }

  const existing = await prisma.workspace.findUnique({
    where: { slug: checkSlug },
    select: { slug: true },
  });

  return Response.json({ available: !existing });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; slug?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const { name, slug } = body;

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 3)) {
    return Response.json(
      { error: "Workspace name must be at least 3 characters." },
      { status: 400 },
    );
  }

  if (slug !== undefined && !isValidSlug(slug)) {
    return Response.json({ error: "Invalid slug format" }, { status: 400 });
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspace: { select: { id: true, slug: true } } },
  });

  if (!membership) {
    return Response.json({ error: "Not a member of this workspace" }, { status: 403 });
  }

  const workspace = membership.workspace;

  if (slug && slug !== workspace.slug) {
    const existing = await prisma.workspace.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing && existing.id !== workspace.id) {
      return Response.json({ error: "Slug is already taken" }, { status: 409 });
    }
  }

  const updated = await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(slug !== undefined && { slug }),
    },
    select: { name: true, slug: true, plan: true },
  });

  return Response.json({ workspace: updated });
}
