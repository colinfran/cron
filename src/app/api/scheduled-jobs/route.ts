import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scheduledJobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { parseExpression } from "cron-parser";

const createScheduledJobSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  schedule: z.string().min(1, "Schedule is required"),
  type: z.enum(["http", "reminder"]).default("http"),
  httpUrl: z.string().url("Invalid URL").optional(),
  httpMethod: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET"),
  httpHeaders: z.record(z.string(), z.string()).optional(),
  httpBody: z.string().optional(),
  timeoutMs: z.number().int().min(1000).max(60000).default(30000),
});

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createScheduledJobSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, schedule, type, httpUrl, httpMethod, httpHeaders, httpBody, timeoutMs } = parsed.data;

  // HTTP jobs require a URL
  if (type === "http" && !httpUrl) {
    return NextResponse.json(
      { error: "HTTP URL is required for HTTP jobs" },
      { status: 400 },
    );
  }

  // Validate cron expression
  try {
    parseExpression(schedule);
  } catch {
    return NextResponse.json(
      { error: "Invalid cron expression" },
      { status: 400 },
    );
  }

  // Compute next run time
  const interval = parseExpression(schedule, { currentDate: new Date(), tz: "UTC" });
  const nextRunAt = interval.next().toDate();

  const job = await db
    .insert(scheduledJobs)
    .values({
      userId: session.user.id,
      name,
      schedule,
      type,
      httpUrl: httpUrl ?? null,
      httpMethod,
      httpHeaders: httpHeaders ?? null,
      httpBody: httpBody ?? null,
      timeoutMs,
      nextRunAt,
    })
    .returning();

  return NextResponse.json(job[0], { status: 201 });
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobList = await db
    .select()
    .from(scheduledJobs)
    .where(eq(scheduledJobs.userId, session.user.id));

  return NextResponse.json(jobList);
}
