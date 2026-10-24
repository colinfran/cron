import { Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DocsIntroduction() {
  return (
    <div className="max-w-3xl">
      <div className="mb-2 flex items-center gap-2 text-sm text-primary">
        <Activity className="h-4 w-4" />
        <span className="font-medium">Documentation</span>
      </div>

      <h1 className="text-4xl font-bold tracking-tight">
        Welcome to Cron
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        Cron is my private workspace for running scheduled HTTP jobs and
        reminders, with a history of failed runs.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <QuickLink
          href="/docs/alert-channels"
          title="Alert Channels"
          description="Set up notifications on Discord, Slack, Telegram, and more."
        />
        <QuickLink
          href="/docs/api"
          title="API Reference"
          description="Full reference for all Cron API endpoints."
        />
      </div>

      <div className="mt-12 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">How it works</h2>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <p>
            Create scheduled HTTP jobs or reminders from the dashboard. Cron
            records each execution and lists failed or timed-out runs in Alerts.
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-border hover:bg-card/40"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
