"server-only";

import { headers } from "next/headers";
import { auth } from "./auth";

export const getServerSession = async function () {
  return await auth.api.getSession({
    headers: await headers(),
  });
};
