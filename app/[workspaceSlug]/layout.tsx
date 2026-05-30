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
import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";
import { buildBaseRoute } from "@/lib/utils";
import { SettingsIcon } from "lucide-react";
import { notFound, redirect } from "next/navigation";

interface Props {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
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
          every: {
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
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <StoreHydrator
          currentWorkspace={membership.workspace}
          workspaces={workspaces}
          user={{ id: user.id, name: user.name, email: user.email, image: user.image }}
        />

        <WorkspaceSidebar />

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
  );
}
