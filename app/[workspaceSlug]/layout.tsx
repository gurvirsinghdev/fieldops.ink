import type { Metadata } from "next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarProvider } from "@/components/ui/sidebar";
import Breadcrumbs from "@/components/workspace/Breadcrumbs";
import WorkspaceSidebar from "@/components/workspace/Sidebar";
import { UserAvatar } from "@/components/workspace/UserAvatar";
import { StoreHydrator } from "@/components/providers/StoreHydrator";
import { WorkspaceProviders } from "@/components/providers/WorkspaceProviders";
import { getServerSession } from "@/lib/auth/helpers";
import prisma from "@/lib/db/prisma";
import { buildBaseRoute } from "@/lib/urls";
import { SettingsIcon } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { SidebarTrigger } from "@/components/workspace/SidebarTrigger";
import { ThemeProvider } from "next-themes";

interface Props {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { workspaceSlug } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: { name: true },
  });

  const title = workspace ? `${workspace.name} — FieldOps` : "FieldOps";

  return {
    title,
  };
}

export default async function WorkspaceLayout({ children, params }: Props) {
  const { workspaceSlug } = await params;
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    return redirect(buildBaseRoute("/signin"));
  }

  const [membership, workspaces] = await Promise.all([
    await prisma.workspaceMember.findFirst({
      where: {
        userId: user.id,
        workspace: { slug: workspaceSlug },
      },
      select: { workspace: true },
    }),
    await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    }),
  ]);

  if (!membership) {
    notFound();
  }

  return (
    <ThemeProvider enableSystem={true} attribute="class" defaultTheme="system">
      <WorkspaceProviders>
        <SidebarProvider>
          <div className="flex h-screen w-full overflow-hidden">
            <StoreHydrator
              currentWorkspace={membership.workspace}
              workspaces={workspaces}
              user={{
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
              }}
            />

            <WorkspaceSidebar trigger={<SidebarTrigger />} />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <header className="bg-muted/40 h-18 flex items-center justify-between px-4 border-b shrink-0">
                <Breadcrumbs />

                <DropdownMenu>
                  <DropdownMenuTrigger className="cursor-pointer">
                    <UserAvatar />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem className="focus:bg-muted">
                      <a href={"/settings"} className="flex gap-2 items-center">
                        <SettingsIcon />
                        <span>Settings</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </header>

              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </WorkspaceProviders>
    </ThemeProvider>
  );
}
