import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

function buildBaseHost() {
  const host = process.env.NEXT_PUBLIC_APP_HOST!;
  const port = host === "localhost" ? ":3000" : "";
  const scheme = host === "localhost" ? "http" : "https";
  return `${scheme}://${host}${port}`;
}

async function verifyState(state: string): Promise<{ slug: string }> {
  const secret = process.env.BETTER_AUTH_SECRET!;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const dotIndex = state.lastIndexOf(".");
  if (dotIndex === -1) {
    throw new Error("Invalid state format");
  }

  const payloadBase64 = state.slice(0, dotIndex);
  const signature = state.slice(dotIndex + 1);

  const decodedPayload = Buffer.from(payloadBase64, "base64url").toString(
    "utf-8",
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    Buffer.from(signature, "base64url"),
    enc.encode(decodedPayload),
  );

  if (!valid) {
    throw new Error("Invalid state signature");
  }

  return JSON.parse(decodedPayload) as { slug: string };
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const realmId = request.nextUrl.searchParams.get("realmId");

  if (!code || !state || !realmId) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 },
    );
  }

  let stateData: { slug: string };
  try {
    stateData = await verifyState(state);
  } catch {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "QuickBooks is not configured" },
      { status: 500 },
    );
  }

  const redirectUri = `${buildBaseHost()}/api/integrations/quickbooks/callback`;

  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to exchange code for tokens" },
      { status: 502 },
    );
  }

  if (!tokenResponse.ok) {
    console.error(
      "QuickBooks token exchange failed:",
      await tokenResponse.text(),
    );
    return NextResponse.json(
      { error: "QuickBooks token exchange failed" },
      { status: 502 },
    );
  }

  const tokenData = await tokenResponse.json();
  const accessToken: string = tokenData.access_token;
  const refreshToken: string = tokenData.refresh_token;
  const expiresIn: number = tokenData.expires_in;

  if (!accessToken || !refreshToken) {
    return NextResponse.json(
      { error: "Invalid token response from QuickBooks" },
      { status: 502 },
    );
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug: stateData.slug },
    select: { id: true },
  });

  if (!workspace) {
    return NextResponse.json(
      { error: "Workspace not found" },
      { status: 404 },
    );
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

  if (existing) {
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
    await prisma.integration.create({
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
    });
  }

  const workspaceRedirectBase = (() => {
    const host = process.env.NEXT_PUBLIC_APP_HOST!;
    const port = host === "localhost" ? ":3000" : "";
    const scheme = host === "localhost" ? "http" : "https";
    return `${scheme}://${stateData.slug}.${host}${port}`;
  })();

  return NextResponse.redirect(
    `${workspaceRedirectBase}/settings/integrations`,
  );
}
