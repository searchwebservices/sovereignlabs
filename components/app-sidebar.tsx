"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
type User = { id?: string; email?: string | null };
import { useState } from "react";
import {
  LayoutDashboard,
  Cpu,
  Puzzle,
  Rocket,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  ShoppingCart,
} from "lucide-react";
import { PlusIcon } from "@/components/icons";
import { SidebarHistory } from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const labNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: Cpu },
  { href: "/parts", label: "Parts", icon: Puzzle },
  { href: "/initiatives", label: "Initiatives", icon: Rocket },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/purchases", label: "Purchases", icon: ShoppingCart },
];

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const [chatHistoryOpen, setChatHistoryOpen] = useState(true);

  const isLabPage = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href);
  };

  const isChatPage =
    pathname === "/" || pathname?.startsWith("/chat/");

  return (
    <>
      <Sidebar className="group-data-[side=left]:border-r-0">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link
                href="/"
                onClick={() => setOpenMobile(false)}
                className="flex items-center gap-2.5 rounded-md px-2 py-2 font-semibold text-sm hover:bg-muted transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-black.png"
                  alt="Sovereign Labs"
                  width={28}
                  height={28}
                  className="size-7 dark:hidden"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-white.png"
                  alt="Sovereign Labs"
                  width={28}
                  height={28}
                  className="size-7 hidden dark:block"
                />
                <span className="truncate">Sovereign Labs</span>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {/* Lab Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Lab
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {labNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isLabPage(item.href)}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Chat Section */}
          <SidebarGroup>
            <div className="flex items-center justify-between pr-1">
              <button
                onClick={() => setChatHistoryOpen(!chatHistoryOpen)}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1 hover:text-foreground transition-colors"
                type="button"
              >
                {chatHistoryOpen ? (
                  <ChevronDown className="size-3" />
                ) : (
                  <ChevronRight className="size-3" />
                )}
                Chat
              </button>
              <div className="flex items-center gap-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setOpenMobile(false);
                        router.push("/");
                        router.refresh();
                      }}
                      type="button"
                      variant="ghost"
                    >
                      <PlusIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent align="end" className="hidden md:block">
                    New Chat
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            {chatHistoryOpen && (
              <SidebarGroupContent>
                <SidebarHistory user={user} />
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          {user && <SidebarUserNav user={user} />}
        </SidebarFooter>
      </Sidebar>

    </>
  );
}
