import { Callout } from "../components";

export default function AlertChannelsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight">Alert Channels</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Configure where scheduled reminder jobs deliver notifications.
      </p>

      <div className="mt-10 space-y-10">
        <Section title="Overview">
          <p className="text-sm text-muted-foreground">
            Configure email, Discord, or custom webhook channels from
            <strong className="text-foreground"> Settings</strong>. Enabled
            channels receive notifications when a reminder job runs.
          </p>
        </Section>

        <Section title="Email">
          <p className="text-sm text-muted-foreground">
            Email reminders are sent through{" "}
            <a
              href="https://franceschini.email"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              useSend
            </a>
            . An email channel is created for a user when they first sign in.
          </p>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>Configure delivery by setting:</p>
            <ul className="list-inside list-disc space-y-2">
              <li><code className="rounded bg-card/60 px-1.5 py-0.5">USESEND_API_KEY</code></li>
              <li><code className="rounded bg-card/60 px-1.5 py-0.5">USESEND_BASE_URL</code> (defaults to https://franceschini.email)</li>
              <li><code className="rounded bg-card/60 px-1.5 py-0.5">USESEND_FROM_EMAIL</code></li>
            </ul>
          </div>
          <Callout type="info">
            Missing credentials or delivery errors mark the scheduled run as
            failed and are shown in the Alerts page.
          </Callout>
        </Section>

        <Section title="Discord">
          <p className="text-sm text-muted-foreground">
            Create an incoming webhook in your Discord server, then add its URL
            under Settings. Reminder notifications are delivered as rich
            embeds.
          </p>
        </Section>

        <Section title="Custom Webhook">
          <p className="text-sm text-muted-foreground">
            Custom channels receive a POST request when a reminder runs:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-[13px] leading-relaxed">
            <code>{`{
  "event": "reminder.triggered",
  "job": {
    "name": "Daily reminder",
    "schedule": "0 9 * * *"
  },
  "timestamp": "2026-10-24T16:00:00.000Z"
}`}</code>
          </pre>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
