"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, BookOpen, LogOut, Settings, Timer } from "lucide-react";
import { CronLogo } from "@/components/cron-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar as SidebarPrimitive, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, useSidebar,
} from "@/components/ui/sidebar";

interface User { name?: string | null; email?: string | null; image?: string | null }

export function Sidebar({ user, signOutAction }: {
  user: User;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const initials = user.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "CF";
  const navItems = [
    { label: "Scheduled jobs", icon: Timer, path: "/dashboard/scheduled" },
    { label: "Alerts", icon: Bell, path: "/dashboard/alerts" },
    { label: "Settings", icon: Settings, path: "/dashboard/settings" },
  ];

  return (
    <SidebarPrimitive>
      <SidebarHeader className="px-4 py-6">
        <Link href="/dashboard/scheduled" className="flex items-center gap-3" onClick={() => setOpenMobile(false)}>
          <CronLogo />
          <div>
            <p className="text-base font-semibold tracking-tight">Cron</p>
            <p className="text-xs text-muted-foreground">Private workspace</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      className="h-10"
                      isActive={active}
                      render={<Link href={item.path} />}
                      onClick={() => setOpenMobile(false)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/docs" />} onClick={() => setOpenMobile(false)}>
                <BookOpen /><span>Documentation</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Account"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="icon" aria-label="Sign out" title="Sign out">
              <LogOut />
            </Button>
          </form>
        </div>
      </SidebarFooter>
    </SidebarPrimitive>
  );
}
