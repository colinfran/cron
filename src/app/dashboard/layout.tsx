import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const user = session.user;

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <SidebarProvider>
        <Sidebar
          user={{ name: user.name, email: user.email, image: user.image }}
          signOutAction={handleSignOut}
        />

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-8">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">Personal workspace</span>
          <div className="ml-auto"><ThemeToggle /></div>
        </header>
        <div className="flex-1 p-4 py-8 sm:p-8 lg:p-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
