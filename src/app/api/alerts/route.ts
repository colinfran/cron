import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scheduledJobs, scheduledRuns } from "@/lib/db/schema";
import { and, count, desc, eq, inArray } from "drizzle-orm";

const PAGE_SIZE = 5;
const failureStatuses = ["failed", "timeout"] as const;

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = Math.max(1, Number.parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10));

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
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(scheduledRuns)
      .innerJoin(scheduledJobs, eq(scheduledRuns.jobId, scheduledJobs.id))
      .where(filters)
      .then((rows) => rows[0]),
  ]);

  const total = totalResult?.total ?? 0;

  return NextResponse.json({
    alerts: runs.map((run) => ({
      ...run,
      startedAt: run.startedAt.toISOString(),
    })),
    total,
    hasMore: page * PAGE_SIZE < total,
  });
}
