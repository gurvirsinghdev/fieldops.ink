import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../procedures";
import prisma from "@/lib/db/prisma";
import type { Prisma } from "@/generated/client";
import { JOB_STATUSES } from "@/lib/constants";

const VALID_PER_PAGE = [20, 30, 50] as const;

export const jobsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        q: z.string().optional(),
        status: z.string().optional(),
        page: z.number().optional(),
        perPage: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const page = Math.max(1, input.page || 1);
      const perPage = (VALID_PER_PAGE as readonly number[]).includes(
        input.perPage ?? 20,
      )
        ? (input.perPage as (typeof VALID_PER_PAGE)[number])
        : 20;
      const query = input.q || "";
      const rawStatus = input.status ?? "";
      const statusFilter = (JOB_STATUSES as readonly string[]).includes(
        rawStatus,
      )
        ? rawStatus
        : "";

      const where: Prisma.JobWhereInput = {
        workspaceId: ctx.workspaceId,
        ...(statusFilter
          ? { status: statusFilter as Prisma.EnumJobStatusFilter["equals"] }
          : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" as const } },
                {
                  customer: {
                    name: { contains: query, mode: "insensitive" as const },
                  },
                },
              ],
            }
          : {}),
      };

      const [rawJobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            scheduledAt: true,
            startedAt: true,
            completedAt: true,
            addressLine1: true,
            city: true,
            province: true,
            postalCode: true,
            country: true,
            customer: {
              select: { id: true, name: true },
            },
          },
          skip: (page - 1) * perPage,
          take: perPage,
          orderBy: { createdAt: "desc" },
        }),
        prisma.job.count({ where }),
      ]);

      const jobs = rawJobs.map((j) => ({
        id: j.id,
        title: j.title,
        description: j.description,
        status: j.status,
        scheduledAt: j.scheduledAt,
        startedAt: j.startedAt,
        completedAt: j.completedAt,
        addressLine1: j.addressLine1,
        city: j.city,
        province: j.province,
        postalCode: j.postalCode,
        country: j.country,
        customer: { id: j.customer.id, name: j.customer.name },
      }));

      return { jobs, total };
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        customerId: z.string().min(1),
        description: z.string().optional().nullable(),
        status: z
          .enum(JOB_STATUSES as unknown as [string, ...string[]])
          .optional(),
        scheduledAt: z.string().optional().nullable(),
        addressLine1: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        province: z.string().optional().nullable(),
        postalCode: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await prisma.customer.findFirst({
        where: { id: input.customerId, workspaceId: ctx.workspaceId },
        select: { id: true },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      if (!input.city) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "City is required",
        });
      }

      const job = await prisma.job.create({
        data: {
          workspaceId: ctx.workspaceId,
          customerId: input.customerId,
          title: input.title.trim(),
          description: input.description || null,
          status:
            (input.status as (typeof JOB_STATUSES)[number]) || "Scheduled",
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
          addressLine1: input.addressLine1 || null,
          city: input.city,
          province: input.province || null,
          postalCode: input.postalCode || null,
          country: input.country || null,
        },
      });

      return { id: job.id };
    }),
});
