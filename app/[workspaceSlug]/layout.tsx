import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";
import { buildBaseRoute } from "@/lib/utils";
import {
  Building2Icon,
  ChevronsUpDownIcon,
  LayoutDashboardIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
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

  const navigationLinks = [
    { title: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  ];
  const bottomNavigationLinks = [
    { title: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/*Sidebar*/}

        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full cursor-pointer outline-none">
                <div className="flex items-center justify-between rounded-lg p-2 gap-2 bg-muted">
                  <div className="size-8 flex aspect-square items-center justify-center text-muted rounded-lg bg-primary">
                    <Building2Icon className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left  leading-tight">
                    <span className="truncate text-sm">
                      {membership.workspace.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {membership.workspace.plan}
                    </span>
                  </div>
                  <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground shrink-0" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {workspaces.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.slug}
                    className="cursor-pointer focus:bg-muted focus:color-background! focus:stroke-background!"
                  >
                    <div className="size-8 flex aspect-square items-center justify-center text-muted rounded-lg bg-primary">
                      <Building2Icon className="size-4 stroke-background!" />
                    </div>
                    <div className="grid flex-1 text-left  leading-tight">
                      <span className="truncate text-sm">{workspace.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {workspace.plan}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarMenu>
              {navigationLinks.map((link, idx) => (
                <SidebarMenuItem key={idx}>
                  <SidebarMenuButton asChild>
                    <Link href={link.href}>
                      <link.icon className="size-4" />
                      <span>{link.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-2 border-t">
            <SidebarMenu>
              {bottomNavigationLinks.map((link, idx) => (
                <SidebarMenuItem key={idx}>
                  <SidebarMenuButton asChild>
                    <Link href={link.href}>
                      <link.icon className="size-4" />
                      <span>{link.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </div>
    </SidebarProvider>
  );
}
