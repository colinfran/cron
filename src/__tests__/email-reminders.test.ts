import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { scheduledJobs } from "@/lib/db/schema";

const mocks = vi.hoisted(() => ({
  channels: vi.fn(),
  saveRun: vi.fn(),
  saveNextRun: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({ from: () => ({ where: mocks.channels }) }),
    insert: () => ({ values: mocks.saveRun }),
    update: () => ({ set: () => ({ where: mocks.saveNextRun }) }),
  },
}));

import { executeJob } from "@/lib/scheduler/execute";

const job: typeof scheduledJobs.$inferSelect = {
  id: "reminder", userId: "user", name: "Daily reminder", type: "reminder",
  status: "active", schedule: "0 9 * * *", httpUrl: null, httpMethod: "GET",
  httpHeaders: null, httpBody: null, timeoutMs: 30000, lastRunAt: null, nextRunAt: null,
  createdAt: new Date(), updatedAt: new Date(),
};

beforeEach(() => {
  vi.stubEnv("USESEND_API_KEY", "test-key");
  vi.stubEnv("USESEND_BASE_URL", "https://mail.example.com");
  vi.stubEnv("USESEND_FROM_EMAIL", "Cron <cron@example.com>");
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.channels.mockResolvedValue([
    { id: "channel", type: "email", config: { email: "owner@example.com" } },
  ]);
  mocks.saveRun.mockResolvedValue(undefined);
  mocks.saveNextRun.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetAllMocks();
});

describe("Scheduled email reminders", () => {
  it("sends through useSend and records a successful execution", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ emailId: "reminder-email" }));
    vi.stubGlobal("fetch", fetchMock);
    await executeJob(job);
    expect(fetchMock).toHaveBeenCalledWith("https://mail.example.com/api/v1/emails", expect.objectContaining({
      method: "POST", body: expect.stringContaining("Reminder: Daily reminder"),
    }));
    expect(mocks.saveRun).toHaveBeenCalledWith(expect.objectContaining({ status: "success", errorMessage: null }));
    expect(mocks.saveNextRun).toHaveBeenCalled();
  });

  it("records a failed run instead of claiming a missing-key email was delivered", async () => {
    vi.stubEnv("USESEND_API_KEY", "");
    await executeJob(job);
    expect(mocks.saveRun).toHaveBeenCalledWith(expect.objectContaining({
      status: "failed", errorMessage: expect.stringContaining("USESEND_API_KEY"),
    }));
    expect(mocks.saveNextRun).toHaveBeenCalled();
  });

  it("records useSend rejection as a failure and continues delivering other channels", async () => {
    mocks.channels.mockResolvedValue([
      { id: "email", type: "email", config: { email: "owner@example.com" } },
      { id: "webhook", type: "webhook", config: { url: "https://hook.example.com" } },
    ]);
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("Rejected sender", { status: 403 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    await executeJob(job);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(mocks.saveRun).toHaveBeenCalledWith(expect.objectContaining({
      status: "failed", errorMessage: expect.stringContaining("HTTP 403"),
    }));
  });
});
