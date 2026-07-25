import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../procedures";
import prisma from "@/lib/db/prisma";
import { getValidAccessToken } from "@/lib/integrations/quickbooks/auth";
import {
  createQBCustomer,
  updateQBCustomer,
} from "@/lib/integrations/quickbooks/api";

const customerFields = z.object({
  name: z.string().min(1),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
});

const VALID_PER_PAGE = [20, 30, 50] as const;

export const customersRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        q: z.string().optional(),
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

      const where = {
        workspaceId: ctx.workspaceId,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" as const } },
                { email: { contains: query, mode: "insensitive" as const } },
                { phone: { contains: query } },
              ],
            }
          : {}),
      };

      const [customers, total, qbIntegration] = await Promise.all([
        prisma.customer.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            addressLine1: true,
            city: true,
            province: true,
            postalCode: true,
            country: true,
          },
          skip: (page - 1) * perPage,
          take: perPage,
          orderBy: { createdAt: "desc" },
        }),
        prisma.customer.count({ where }),
        prisma.integration.findFirst({
          where: {
            workspaceId: ctx.workspaceId,
            provider: "quickbooks",
            status: "Connected",
          },
          select: { id: true },
        }),
      ]);

      return { customers, total, qbConnected: !!qbIntegration };
    }),

  search: protectedProcedure
    .input(z.object({ q: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const customers = await prisma.customer.findMany({
        where: {
          workspaceId: ctx.workspaceId,
          ...(input.q
            ? { name: { contains: input.q, mode: "insensitive" as const } }
            : {}),
        },
        select: { id: true, name: true },
        take: 20,
        orderBy: { name: "asc" },
      });

      return customers;
    }),

  create: protectedProcedure
    .input(customerFields)
    .mutation(async ({ ctx, input }) => {
      const customer = await prisma.customer.create({
        data: {
          workspaceId: ctx.workspaceId,
          name: input.name.trim(),
          email: input.email || null,
          phone: input.phone || null,
          addressLine1: input.addressLine1 || null,
          addressLine2: input.addressLine2 || null,
          city: input.city || null,
          province: input.province || null,
          postalCode: input.postalCode || null,
          country: input.country || null,
        },
      });

      let qbId: string | null = null;
      try {
        const integration = await prisma.integration.findFirst({
          where: {
            workspaceId: ctx.workspaceId,
            provider: "quickbooks",
            status: "Connected",
          },
          select: { id: true, externalAccountId: true },
        });

        if (integration?.externalAccountId) {
          const accessToken = await getValidAccessToken(integration.id);
          qbId = await createQBCustomer(
            accessToken,
            integration.externalAccountId,
            {
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              addressLine1: customer.addressLine1,
              city: customer.city,
              province: customer.province,
              postalCode: customer.postalCode,
              country: customer.country,
            },
          );

          if (qbId) {
            await prisma.externalEntityLink.create({
              data: {
                workspaceId: ctx.workspaceId,
                integrationId: integration.id,
                localEntityType: "Customer",
                localEntityId: customer.id,
                externalEntityType: "Customer",
                externalEntityId: qbId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            });
          }
        }
      } catch (err) {
        console.error("Failed to create QB customer:", err);
      }

      return { id: customer.id, ...(qbId ? { qbId } : {}) };
    }),

  update: protectedProcedure
    .input(customerFields.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.customer.findFirst({
        where: { id: input.id, workspaceId: ctx.workspaceId },
        select: { id: true, name: true },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const updateData = {
        name: input.name.trim(),
        email: input.email || null,
        phone: input.phone || null,
        addressLine1: input.addressLine1 || null,
        addressLine2: input.addressLine2 || null,
        city: input.city || null,
        province: input.province || null,
        postalCode: input.postalCode || null,
        country: input.country || null,
      };

      const updated = await prisma.customer.update({
        where: { id: input.id },
        data: updateData,
      });

      try {
        const link = await prisma.externalEntityLink.findFirst({
          where: {
            workspaceId: ctx.workspaceId,
            localEntityType: "Customer",
            localEntityId: input.id,
          },
          select: { externalEntityId: true, integrationId: true },
        });

        if (link) {
          const integration = await prisma.integration.findFirst({
            where: {
              id: link.integrationId,
              status: "Connected",
            },
            select: { id: true, externalAccountId: true },
          });

          if (integration?.externalAccountId) {
            const accessToken = await getValidAccessToken(integration.id);
            await updateQBCustomer(
              accessToken,
              integration.externalAccountId,
              link.externalEntityId,
              {
                name: updateData.name,
                email: updateData.email,
                phone: updateData.phone,
                addressLine1: updateData.addressLine1,
                city: updateData.city,
                province: updateData.province,
                postalCode: updateData.postalCode,
                country: updateData.country,
              },
            );
          }
        }
      } catch (err) {
        console.error(`Failed to update QB customer "${existing.name}":`, err);
      }

      return { id: updated.id };
    }),
});
