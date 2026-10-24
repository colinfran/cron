import Link from "next/link";
import { CronLogo } from "@/components/cron-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DocsSidebar } from "./docs-sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DocsSidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-8">
          <SidebarTrigger />
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <CronLogo className="size-6" />Cron
          </Link>
          <Badge variant="secondary">Docs</Badge>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" render={<Link href="/dashboard" />}>Dashboard</Button>
          </div>
        </header>
        <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
