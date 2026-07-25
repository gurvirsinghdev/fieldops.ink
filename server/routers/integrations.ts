import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../procedures";
import prisma from "@/lib/db/prisma";
import {
  revokeQuickBooksToken,
  getValidAccessToken,
} from "@/lib/integrations/quickbooks/auth";
import {
  fetchQBCustomers,
  createQBCustomer,
} from "@/lib/integrations/quickbooks/api";

export const integrationsRouter = router({
  disconnect: protectedProcedure
    .input(z.object({ integrationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const integration = await prisma.integration.findUnique({
        where: { id: input.integrationId },
        select: {
          id: true,
          workspaceId: true,
          provider: true,
          refreshTokenEncrypted: true,
        },
      });

      if (!integration) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (integration.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (integration.provider === "quickbooks") {
        await revokeQuickBooksToken(integration.refreshTokenEncrypted);
      }

      await prisma.integration.update({
        where: { id: input.integrationId },
        data: {
          status: "Disconnected",
          accessTokenEncrypted: null,
          refreshTokenEncrypted: null,
          tokenExpiresAt: null,
        },
      });

      return { ok: true };
    }),

  syncCustomers: protectedProcedure.mutation(async ({ ctx }) => {
    const integration = await prisma.integration.findFirst({
      where: {
        workspaceId: ctx.workspaceId,
        provider: "quickbooks",
        status: "Connected",
      },
      select: { id: true, externalAccountId: true },
    });

    if (!integration || !integration.externalAccountId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "QuickBooks is not connected",
      });
    }

    let accessToken: string;
    try {
      accessToken = await getValidAccessToken(integration.id);
    } catch (err) {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message: `Token refresh failed: ${(err as Error).message}`,
      });
    }

    const realmId = integration.externalAccountId;

    const links = await prisma.externalEntityLink.findMany({
      where: {
        integrationId: integration.id,
        localEntityType: "Customer",
      },
      select: {
        localEntityId: true,
        externalEntityId: true,
      },
    });

    const linkByQbId = new Map<string, string>();
    const linkByLocalId = new Map<string, string>();
    for (const link of links) {
      linkByQbId.set(link.externalEntityId, link.localEntityId);
      linkByLocalId.set(link.localEntityId, link.externalEntityId);
    }

    const localCustomers = await prisma.customer.findMany({
      where: { workspaceId: ctx.workspaceId },
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
    });

    let qbCustomers;
    try {
      qbCustomers = await fetchQBCustomers(accessToken, realmId);
    } catch (err) {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message: `Failed to fetch QB customers: ${(err as Error).message}`,
      });
    }

    let imported = 0;
    let exported = 0;
    let errors = 0;

    for (const qb of qbCustomers) {
      if (!qb.name) continue;

      try {
        const localId = linkByQbId.get(qb.qbId);

        if (localId) {
          await prisma.customer.update({
            where: { id: localId },
            data: {
              name: qb.name,
              email: qb.email,
              phone: qb.phone,
              addressLine1: qb.addressLine1,
              city: qb.city,
              province: qb.province,
              postalCode: qb.postalCode,
              country: qb.country,
            },
          });
          imported++;
        } else {
          const existingByName = localCustomers.find(
            (c) => c.name.toLowerCase() === qb.name.toLowerCase(),
          );

          let customerId: string;

          if (existingByName) {
            customerId = existingByName.id;
            await prisma.customer.update({
              where: { id: customerId },
              data: {
                email: qb.email,
                phone: qb.phone,
                addressLine1: qb.addressLine1,
                city: qb.city,
                province: qb.province,
                postalCode: qb.postalCode,
                country: qb.country,
              },
            });
          } else {
            const created = await prisma.customer.create({
              data: {
                workspaceId: ctx.workspaceId,
                name: qb.name,
                email: qb.email,
                phone: qb.phone,
                addressLine1: qb.addressLine1,
                city: qb.city,
                province: qb.province,
                postalCode: qb.postalCode,
                country: qb.country,
              },
            });
            customerId = created.id;
          }

          await prisma.externalEntityLink.create({
            data: {
              workspaceId: ctx.workspaceId,
              integrationId: integration.id,
              localEntityType: "Customer",
              localEntityId: customerId,
              externalEntityType: "Customer",
              externalEntityId: qb.qbId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });

          linkByLocalId.set(customerId, qb.qbId);
          imported++;
        }
      } catch (err) {
        console.error(
          `Sync error importing QB customer "${qb.name}" (${qb.qbId}):`,
          err,
        );
        errors++;
      }
    }

    for (const local of localCustomers) {
      const qbId = linkByLocalId.get(local.id);
      if (qbId) continue;

      const qbDuplicate = qbCustomers.find(
        (q) => q.name.toLowerCase() === local.name.toLowerCase(),
      );
      if (qbDuplicate) {
        try {
          await prisma.externalEntityLink.create({
            data: {
              workspaceId: ctx.workspaceId,
              integrationId: integration.id,
              localEntityType: "Customer",
              localEntityId: local.id,
              externalEntityType: "Customer",
              externalEntityId: qbDuplicate.qbId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
          linkByLocalId.set(local.id, qbDuplicate.qbId);
        } catch {
          // link may already exist
        }
        continue;
      }

      try {
        const newQbId = await createQBCustomer(accessToken, realmId, {
          name: local.name,
          email: local.email,
          phone: local.phone,
          addressLine1: local.addressLine1,
          city: local.city,
          province: local.province,
          postalCode: local.postalCode,
          country: local.country,
        });

        if (newQbId) {
          await prisma.externalEntityLink.create({
            data: {
              workspaceId: ctx.workspaceId,
              integrationId: integration.id,
              localEntityType: "Customer",
              localEntityId: local.id,
              externalEntityType: "Customer",
              externalEntityId: newQbId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
          exported++;
        }
      } catch (err) {
        console.error(
          `Sync error exporting local customer "${local.name}" (${local.id}):`,
          err,
        );
        errors++;
      }
    }

    return { imported, exported, errors };
  }),
});
