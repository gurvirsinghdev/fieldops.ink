import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "../procedures";
import prisma from "@/lib/db/prisma";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MIN_LENGTH = 3;

export const workspaceRouter = router({
  members: protectedProcedure.query(async ({ ctx }) => {
    const [members, invitations] = await Promise.all([
      prisma.workspaceMember.findMany({
        where: { workspaceId: ctx.workspaceId },
        select: {
          id: true,
          role: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.invitation.findMany({
        where: {
          workspaceId: ctx.workspaceId,
          status: "Pending",
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          expiresAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      members,
      invitations,
      currentRole:
        members.find((m) => m.user.id === ctx.userId)?.role ?? "Member",
      currentUserId: ctx.userId,
    };
  }),

  checkSlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      if (input.slug.length < SLUG_MIN_LENGTH || !SLUG_REGEX.test(input.slug)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid slug format",
        });
      }

      const existing = await prisma.workspace.findUnique({
        where: { slug: input.slug },
        select: { slug: true },
      });

      return { available: !existing };
    }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).optional(),
        slug: z.string().min(3).regex(SLUG_REGEX).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const membership = await prisma.workspaceMember.findFirst({
        where: { userId: ctx.userId },
        select: { workspace: { select: { id: true, slug: true } } },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not a member of this workspace",
        });
      }

      const workspace = membership.workspace;

      if (input.slug && input.slug !== workspace.slug) {
        const existing = await prisma.workspace.findUnique({
          where: { slug: input.slug },
          select: { id: true },
        });

        if (existing && existing.id !== workspace.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Slug is already taken",
          });
        }
      }

      const updated = await prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          ...(input.name !== undefined && { name: input.name.trim() }),
          ...(input.slug !== undefined && { slug: input.slug }),
        },
        select: { name: true, slug: true, plan: true, image: true },
      });

      return { workspace: updated };
    }),
});
