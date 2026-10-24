import { EndpointBlock } from "../components";

export default function ApiReferencePage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight">API Reference</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Endpoints for scheduled jobs, alert channels, and run history.
      </p>

      <div className="mt-10 space-y-12">
        <Section title="Scheduled Jobs">
          <EndpointBlock
            method="GET"
            path="/api/scheduled-jobs"
            description="List scheduled jobs in your workspace."
            auth
            response={`[
  {
    "id": "abc123",
    "name": "Daily report",
    "status": "active",
    "type": "http",
    "schedule": "0 9 * * *",
    "httpUrl": "https://api.example.com/report",
    "nextRunAt": "2026-10-25T09:00:00.000Z"
  }
]`}
          />
          <EndpointBlock
            method="POST"
            path="/api/scheduled-jobs"
            description="Create an HTTP or reminder job. HTTP jobs require httpUrl."
            auth
            body={`{
  "name": "Daily report",
  "schedule": "0 9 * * *",
  "type": "http",
  "httpUrl": "https://api.example.com/report",
  "httpMethod": "POST"
}`}
          />
          <EndpointBlock
            method="GET"
            path="/api/scheduled-jobs/:id"
            description="Get a scheduled job owned by the signed-in user."
            auth
          />
          <EndpointBlock
            method="PATCH"
            path="/api/scheduled-jobs/:id"
            description="Update a job's name, schedule, status, or request configuration."
            auth
          />
          <EndpointBlock
            method="DELETE"
            path="/api/scheduled-jobs/:id"
            description="Delete a job and its execution history."
            auth
          />
          <EndpointBlock
            method="GET"
            path="/api/scheduled-jobs/:id/runs"
            description="List execution history for a scheduled job."
            auth
            queryParams="limit=50&offset=0"
          />
          <EndpointBlock
            method="POST"
            path="/api/scheduled-jobs/:id/trigger"
            description="Run a scheduled job immediately."
            auth
          />
        </Section>

        <Section title="Alert Channels">
          <EndpointBlock
            method="GET"
            path="/api/alert-channels"
            description="List alert channels in your workspace."
            auth
          />
          <EndpointBlock
            method="POST"
            path="/api/alert-channels"
            description="Create an alert channel. Supported dashboard options are email, Discord, and custom webhook."
            auth
            body={`{ "type": "email", "email": "user@example.com" }

{ "type": "discord", "webhookUrl": "https://discord.com/api/webhooks/..." }

{ "type": "webhook", "url": "https://example.com/hook", "label": "My Hook" }`}
          />
          <EndpointBlock
            method="PATCH"
            path="/api/alert-channels/:id"
            description="Enable or disable an alert channel."
            auth
            body={`{ "enabled": false }`}
          />
          <EndpointBlock
            method="DELETE"
            path="/api/alert-channels/:id"
            description="Delete an alert channel."
            auth
          />
        </Section>

        <Section title="Alerts">
          <EndpointBlock
            method="GET"
            path="/api/alerts"
            description="List failed and timed-out scheduled job runs."
            auth
            queryParams="page=1"
            response={`{
  "alerts": [
    {
      "id": "run123",
      "status": "failed",
      "jobName": "Daily report",
      "errorMessage": "HTTP 500 Internal Server Error",
      "responseCode": 500,
      "startedAt": "2026-10-24T09:00:00.000Z"
    }
  ],
  "total": 1,
  "hasMore": false
}`}
          />
        </Section>

        <Section title="Authentication">
          <p className="text-sm text-muted-foreground">
            API routes require an authenticated session. Account registration
            is disabled for this private workspace.
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
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}
