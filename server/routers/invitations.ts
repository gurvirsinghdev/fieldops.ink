import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../procedures";
import prisma from "@/lib/db/prisma";
import { buildBaseRoute } from "@/lib/urls";
import { sendEmail } from "@/lib/integrations/email";

export const invitationsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email().min(1),
        role: z.enum(["Owner", "Admin", "Member"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const membership = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: ctx.workspaceId,
          userId: ctx.userId,
          role: { in: ["Owner", "Admin"] },
        },
        select: { id: true },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners and admins can invite members",
        });
      }

      const email = input.email.trim().toLowerCase();
      const role = input.role || "Member";

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          workspaceMembers: {
            where: { workspaceId: ctx.workspaceId },
            select: { id: true },
          },
        },
      });

      if (user?.workspaceMembers.length) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a member of this workspace",
        });
      }

      const existingInvite = await prisma.invitation.findFirst({
        where: {
          workspaceId: ctx.workspaceId,
          email,
          status: "Pending",
        },
        select: { id: true },
      });

      if (existingInvite) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An invitation has already been sent to this email",
        });
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.invitation.create({
        data: {
          workspaceId: ctx.workspaceId,
          email,
          role: role as "Owner" | "Admin" | "Member",
          token,
          expiresAt,
        },
      });

      const inviteLink = `${buildBaseRoute("")}/invite/${token}`;

      const workspace = await prisma.workspace.findUnique({
        where: { id: ctx.workspaceId },
        select: { name: true },
      });

      const inviterName = ctx.userId;
      const workspaceName = workspace?.name ?? "FieldOps";
      const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();

      const emailSent = await sendEmail({
        to: email,
        subject: `Invited you to ${workspaceName} on FieldOps`,
        html: [
          `<p>You have been invited to join <strong>${workspaceName}</strong> as a ${roleLabel}.</p>`,
          `<p><a href="${inviteLink}">Accept invitation</a></p>`,
          `<p style="color:#888;font-size:12px">This invitation expires in 7 days.</p>`,
        ].join(""),
        text: [
          `You have been invited to join ${workspaceName} as a ${roleLabel}.`,
          `Accept: ${inviteLink}`,
          "This invitation expires in 7 days.",
        ].join("\n\n"),
      });

      return { link: inviteLink, emailSent };
    }),

  revoke: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await prisma.invitation.findFirst({
        where: {
          id: input.id,
          workspaceId: ctx.workspaceId,
          status: "Pending",
        },
        select: { id: true },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found or already processed",
        });
      }

      await prisma.invitation.delete({
        where: { id: input.id },
      });

      return { ok: true };
    }),
});
