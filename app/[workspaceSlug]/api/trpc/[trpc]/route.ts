import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/_app";
import { createContext } from "@/server/context";

const handler = async (
  req: Request,
  { params }: { params: Promise<{ workspaceSlug: string }> },
) => {
  const { workspaceSlug } = await params;

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(workspaceSlug),
  });
};

export { handler as GET, handler as POST };
