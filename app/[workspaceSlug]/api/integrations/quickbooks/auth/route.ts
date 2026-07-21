import { NextRequest, NextResponse } from "next/server";
import { buildBaseHost } from "@/lib/integrations/quickbooks/auth";
import { getWorkspaceId } from "@/lib/workspace/helpers";

async function signState(slug: string): Promise<string> {
  const secret = process.env.BETTER_AUTH_SECRET!;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const payload = JSON.stringify({ slug });
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payload),
  );

  return `${Buffer.from(payload).toString("base64url")}.${Buffer.from(sig).toString("base64url")}`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceSlug: string }> },
) {
  const { workspaceSlug } = await params;

  const workspaceResult = await getWorkspaceId(workspaceSlug);
  if (typeof workspaceResult !== "string") return workspaceResult;

  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "QuickBooks is not configured" },
      { status: 500 },
    );
  }

  const state = await signState(workspaceSlug);

  const scopes = "com.intuit.quickbooks.accounting";

  const redirectUri = `${buildBaseHost()}/api/integrations/quickbooks/callback`;

  const authUrl = new URL("https://appcenter.intuit.com/connect/oauth2");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
