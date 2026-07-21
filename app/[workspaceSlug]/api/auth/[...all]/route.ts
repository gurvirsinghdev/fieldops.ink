// Duplicated from /base/api/auth/[...all]/route.ts
// Both are required: rewrites route fieldops.ink/api/auth/* → /base/api/auth/*,
// and *.fieldops.ink/api/auth/* → /:workspaceSlug/api/auth/*
import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth/server";

export const { GET, POST } = toNextJsHandler(auth);
