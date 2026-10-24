import { CodeBlock } from "../components";

export default function IntegrationsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight">Integrations</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Configure scheduled HTTP requests and reminder notifications from the
        dashboard.
      </p>

      <div className="mt-10 space-y-10">
        <Section title="Scheduled HTTP requests">
          <p className="text-sm text-muted-foreground">
            Create a scheduled job, enter the endpoint URL and HTTP method, and
            set its cron schedule. Cron sends the request on schedule and
            records its response code, duration, and response body in the run
            history.
          </p>
          <div className="mt-4">
            <CodeBlock
              code={`{
  "name": "Daily report",
  "schedule": "0 9 * * *",
  "type": "http",
  "httpUrl": "https://api.example.com/report",
  "httpMethod": "POST",
  "httpHeaders": {
    "Authorization": "Bearer <token>"
  }
}`}
            />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Keep credentials private and use HTTPS endpoints. The job detail
            page shows recent runs; failed or timed-out runs are also listed in
            Alerts.
          </p>
        </Section>

        <Section title="Reminder notifications">
          <p className="text-sm text-muted-foreground">
            Create a reminder job and configure email, Discord, or custom
            webhook channels in Settings. Enabled channels receive a
            notification each time the reminder runs.
          </p>
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
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
