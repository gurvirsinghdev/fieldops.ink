import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async function (user) {
          const firstName = user.name.split(/\s/).shift();
          const workspaceName = !firstName
            ? "Default Workspace"
            : `${firstName}'s Workspace`;

          await prisma.workspace.create({
            data: {
              name: workspaceName,
              slug: crypto.randomUUID(),
              members: {
                create: {
                  userId: user.id,
                  role: "Owner",
                },
              },
            },
          });
        },
      },
    },
  },
  advanced: {
    cookies: {
      session_token: {
        name: "better-auth.session_token",
        attributes: {
          sameSite: "lax",
          domain: process.env.NEXT_PUBLIC_APP_HOST,
          secure: process.env.NODE_ENV === "production",
        },
      },
    },
  },
  trustedOrigins: ["*"],
});
