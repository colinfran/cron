"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bell,
  Webhook,
  Code,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar,
} from "@/components/ui/sidebar";

const sections = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs", icon: BookOpen },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Alert Channels", href: "/docs/alert-channels", icon: Bell },
      { title: "Integrations", href: "/docs/integrations", icon: Webhook },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "API Overview", href: "/docs/api", icon: Code },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarContent className="py-6">
        {sections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className="h-10"
                      onClick={() => setOpenMobile(false)}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
