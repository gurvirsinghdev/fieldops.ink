import "server-only";

import prisma from "@/lib/db/prisma";
import { decrypt, encrypt } from "./encryption";

export function buildBaseHost() {
  const host = process.env.NEXT_PUBLIC_APP_HOST!;
  const port = host === "localhost" ? ":3000" : "";
  const scheme = host === "localhost" ? "http" : "https";
  return `${scheme}://${host}${port}`;
}

const TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const REVOKE_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/revoke";

function getClientCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("QuickBooks is not configured");
  }
  return { clientId, clientSecret };
}

function basicAuthHeader(): string {
  const { clientId, clientSecret } = getClientCredentials();
  return (
    "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  );
}

export async function getValidAccessToken(
  integrationId: string,
): Promise<string> {
  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
    select: {
      accessTokenEncrypted: true,
      refreshTokenEncrypted: true,
      tokenExpiresAt: true,
      status: true,
    },
  });

  if (!integration) {
    throw new Error("Integration not found");
  }

  if (integration.status !== "Connected") {
    throw new Error("Integration is not connected");
  }

  if (
    integration.accessTokenEncrypted &&
    integration.tokenExpiresAt &&
    integration.tokenExpiresAt > new Date(Date.now() + 5 * 60 * 1000)
  ) {
    return decrypt(integration.accessTokenEncrypted);
  }

  if (!integration.refreshTokenEncrypted) {
    await prisma.integration.update({
      where: { id: integrationId },
      data: { status: "Disconnected" },
    });
    throw new Error("No refresh token available — re-authorization required");
  }

  const refreshToken = await decrypt(integration.refreshTokenEncrypted);

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    await prisma.integration.update({
      where: { id: integrationId },
      data: {
        status: "Disconnected",
        accessTokenEncrypted: null,
        refreshTokenEncrypted: null,
        tokenExpiresAt: null,
      },
    });
    throw new Error(
      `QuickBooks token refresh failed (${response.status}) — integration disconnected`,
    );
  }

  const data = await response.json();
  const newAccessToken: string = data.access_token;
  const newRefreshToken: string = data.refresh_token;
  const expiresIn: number = data.expires_in;

  if (!newAccessToken || !newRefreshToken) {
    await prisma.integration.update({
      where: { id: integrationId },
      data: { status: "Disconnected" },
    });
    throw new Error("Invalid token response from QuickBooks");
  }

  const [encryptedAccess, encryptedRefresh] = await Promise.all([
    encrypt(newAccessToken),
    encrypt(newRefreshToken),
  ]);

  await prisma.integration.update({
    where: { id: integrationId },
    data: {
      accessTokenEncrypted: encryptedAccess,
      refreshTokenEncrypted: encryptedRefresh,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
    },
  });

  return newAccessToken;
}

export async function revokeQuickBooksToken(
  refreshTokenEncrypted: string | null,
): Promise<void> {
  if (!refreshTokenEncrypted) return;

  try {
    const refreshToken = await decrypt(refreshTokenEncrypted);

    await fetch(REVOKE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuthHeader(),
      },
      body: new URLSearchParams({ token: refreshToken }),
    });
  } catch {
    // Token may already be expired or revoked — proceed with local cleanup
  }
}

export async function completeQuickBooksAuth(
  code: string,
  realmId: string,
  workspaceSlug: string,
): Promise<{ integrationId: string; accessToken: string }> {
  getClientCredentials(); // validates credentials are configured

  const redirectUri = `${buildBaseHost()}/api/integrations/quickbooks/callback`;

  const tokenResponse = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(
      `QuickBooks token exchange failed (${tokenResponse.status})`,
    );
  }

  const tokenData = await tokenResponse.json();
  const accessToken: string = tokenData.access_token;
  const refreshToken: string = tokenData.refresh_token;
  const expiresIn: number = tokenData.expires_in;

  if (!accessToken || !refreshToken) {
    throw new Error("Invalid token response from QuickBooks");
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: { id: true },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const [encryptedAccess, encryptedRefresh] = await Promise.all([
    encrypt(accessToken),
    encrypt(refreshToken),
  ]);

  const existing = await prisma.integration.findFirst({
    where: {
      workspaceId: workspace.id,
      provider: "quickbooks",
      externalAccountId: realmId,
    },
    select: { id: true },
  });

  let integrationId: string;

  if (existing) {
    integrationId = existing.id;
    await prisma.integration.update({
      where: { id: existing.id },
      data: {
        status: "Connected",
        accessTokenEncrypted: encryptedAccess,
        refreshTokenEncrypted: encryptedRefresh,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    });
  } else {
    const created = await prisma.integration.create({
      data: {
        workspaceId: workspace.id,
        provider: "quickbooks",
        name: "QuickBooks",
        status: "Connected",
        externalAccountId: realmId,
        accessTokenEncrypted: encryptedAccess,
        refreshTokenEncrypted: encryptedRefresh,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      },
      select: { id: true },
    });
    integrationId = created.id;
  }

  return { integrationId, accessToken };
}
