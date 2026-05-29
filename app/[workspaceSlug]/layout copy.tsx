import { getServerSession } from "@/lib/auth.actions";
import { buildBaseRoute } from "@/lib/utils";
import { redirect } from "next/navigation";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  ShieldCheck,
  HelpCircle,
  ChevronsUpDown,
  Building2,
} from "lucide-react";

// Navigation items structured for easy rendering and maintenance
const mainNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Team", href: "/team", icon: Users },
  { title: "Security", href: "/security", icon: ShieldCheck },
];

const secondaryNavItems = [
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Help & Support", href: "/support", icon: HelpCircle },
];

interface Props {
  children: React.ReactNode;
}

const pathname = "/dashboard";

export default async function WorkspaceLayout({ children }: Props) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    return redirect(buildBaseRoute("/signin"));
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "pb-12 min-h-screen border-r bg-sidebar flex flex-col justify-between w-64",
        )}
      >
        <div className="px-3 py-4 flex-1 flex flex-col min-h-0">
          {/* Enterprise Org Switcher Header */}
          <div className="flex items-center justify-between px-2 py-1.5 mb-4 border rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sm">
                  Acme Corp
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Enterprise Plan
                </span>
              </div>
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground shrink-0" />
          </div>

          {/* Navigation Areas */}
          <ScrollArea className="flex-1 -mx-3 px-3">
            <div className="space-y-6">
              {/* Main Section */}
              <div>
                <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Platform
                </div>
                <div className="space-y-1">
                  {mainNavItems.map((item) => (
                    <Button
                      key={item.href}
                      asChild
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 font-normal text-sm h-9",
                        pathname === item.href &&
                          "font-medium bg-secondary text-secondary-foreground",
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Secondary/System Section */}
              <div>
                <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  System
                </div>
                <div className="space-y-1">
                  {secondaryNavItems.map((item) => (
                    <Button
                      key={item.href}
                      asChild
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 font-normal text-sm h-9",
                        pathname === item.href &&
                          "font-medium bg-secondary text-secondary-foreground",
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* User Profile Footer */}
        <div className="mt-auto p-3 border-t">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden">
              <span className="truncate font-medium text-sm">John Doe</span>
              <span className="truncate text-xs text-muted-foreground">
                john.doe@acme.com
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Optional Top Header for mobile menu / breadcrumbs */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 md:h-16 shrink-0">
          <div className="flex-1">
            <span className="text-sm font-medium text-muted-foreground">
              Workspace / Dashboard
            </span>
          </div>
        </header>

        {/* Scrollable Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
