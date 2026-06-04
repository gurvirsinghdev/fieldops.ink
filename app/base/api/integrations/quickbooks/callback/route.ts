import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { completeQuickBooksAuth } from "@/lib/quickbooks";
import { fetchCompanyInfo } from "@/lib/quickbooks-api";

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

function buildWorkspaceRedirect(slug: string, query?: string): string {
  const host = process.env.NEXT_PUBLIC_APP_HOST!;
  const port = host === "localhost" ? ":3000" : "";
  const scheme = host === "localhost" ? "http" : "https";
  const base = `${scheme}://${slug}.${host}${port}/settings/integrations`;
  return query ? `${base}?${query}` : base;
}

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  const state = request.nextUrl.searchParams.get("state");

  if (error) {
    let stateData: { slug: string } | null = null;
    if (state) {
      try {
        stateData = await verifyState(state);
      } catch {
        // state invalid — redirect without workspace context
      }
    }

    const message =
      error === "access_denied"
        ? "error=Authorization was cancelled"
        : "error=Authorization failed";

    if (stateData) {
      return NextResponse.redirect(
        buildWorkspaceRedirect(stateData.slug, message),
      );
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }

  const code = request.nextUrl.searchParams.get("code");
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

  let result: { integrationId: string; accessToken: string };
  try {
    result = await completeQuickBooksAuth(code, realmId, stateData.slug);
  } catch (err) {
    console.error("QuickBooks auth failed:", err);
    return NextResponse.json(
      { error: `QuickBooks authorization failed: ${(err as Error).message}` },
      { status: 502 },
    );
  }

  // Fetch and store QuickBooks company info
  try {
    const companyInfo = await fetchCompanyInfo(result.accessToken, realmId);

    await prisma.integration.update({
      where: { id: result.integrationId },
      data: {
        externalName: companyInfo.companyName,
        config: JSON.parse(JSON.stringify({ companyInfo })),
      },
    });
  } catch (err) {
    console.error("Failed to fetch QuickBooks company info:", err);
  }

  return NextResponse.redirect(buildWorkspaceRedirect(stateData.slug));
}
