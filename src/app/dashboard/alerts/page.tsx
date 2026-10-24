import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scheduledJobs, scheduledRuns } from "@/lib/db/schema";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { AlertHistory } from "@/components/alert-history";

const PAGE_SIZE = 5;
const failureStatuses = ["failed", "timeout"] as const;

export default async function AlertsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const filters = and(
    eq(scheduledJobs.userId, session.user.id),
    inArray(scheduledRuns.status, failureStatuses),
  );

  const [runs, totalResult] = await Promise.all([
    db
      .select({
        id: scheduledRuns.id,
        status: scheduledRuns.status,
        jobName: scheduledJobs.name,
        errorMessage: scheduledRuns.errorMessage,
        responseCode: scheduledRuns.responseCode,
        startedAt: scheduledRuns.startedAt,
      })
      .from(scheduledRuns)
      .innerJoin(scheduledJobs, eq(scheduledRuns.jobId, scheduledJobs.id))
      .where(filters)
      .orderBy(desc(scheduledRuns.startedAt))
      .limit(PAGE_SIZE),
    db
      .select({ total: count() })
      .from(scheduledRuns)
      .innerJoin(scheduledJobs, eq(scheduledRuns.jobId, scheduledJobs.id))
      .where(filters)
      .then((rows) => rows[0]),
  ]);

  const total = totalResult?.total ?? 0;
  const initialAlerts = runs
    .filter(
      (run): run is typeof run & { status: "failed" | "timeout" } =>
        run.status !== "success",
    )
    .map((run) => ({
      ...run,
      startedAt: run.startedAt.toISOString(),
    }));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Scheduled job failures and timeouts.
        </p>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-1 text-base font-semibold">No alerts yet</h3>
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            Failed or timed out scheduled job runs will appear here.
          </p>
        </div>
      ) : (
        <AlertHistory
          initialData={{
            alerts: initialAlerts,
            total,
            hasMore: runs.length < total,
          }}
        />
      )}
    </div>
  );
}
