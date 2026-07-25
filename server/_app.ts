import { router } from "./procedures";
import { customersRouter } from "./routers/customers";
import { jobsRouter } from "./routers/jobs";
import { invitationsRouter } from "./routers/invitations";
import { integrationsRouter } from "./routers/integrations";
import { workspaceRouter } from "./routers/workspace";

export const appRouter = router({
  customer: customersRouter,
  job: jobsRouter,
  invitation: invitationsRouter,
  integration: integrationsRouter,
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
