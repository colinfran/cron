import { Github, LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { CronLogo } from "@/components/cron-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <main className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between p-6 sm:p-8">
        <div className="flex items-center gap-2.5 font-semibold">
          <CronLogo className="size-7" />
          Cron
        </div>
        <ThemeToggle />
      </header>
      <div className="flex flex-1 items-center justify-center px-6 pb-24">
        <div className="w-full max-w-sm">
          <p className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <LockKeyhole className="size-3.5" />
            Private workspace
          </p>
          <h1 className="text-5xl font-semibold tracking-tight">Cron</h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            My personal console for scheduling jobs and keeping things running on time.
          </p>
          <Card className="mt-8 shadow-none">
            <CardContent>
              <form action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}>
                <Button type="submit" size="lg" className="h-11 w-full gap-2">
                  <Github className="size-4" />
                  Continue with GitHub
                </Button>
              </form>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Access is limited to my GitHub account.
              </p>
            </CardContent>
          </Card>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Unable to sign in</AlertTitle>
              <AlertDescription>
                {error === "AccessDenied"
                  ? "This is a private workspace. Sign in with the authorized GitHub account."
                  : "GitHub sign-in failed. Please try again or check the OAuth configuration."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      <footer className="pb-6 text-center text-xs text-muted-foreground">
        A Franceschini workspace
      </footer>
    </main>
  );
}
