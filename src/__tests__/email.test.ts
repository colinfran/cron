import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendReminderEmail } from "@/lib/alerts/email";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("USESEND_API_KEY", "test-usesend-key");
  vi.stubEnv("USESEND_BASE_URL", "");
  vi.stubEnv("USESEND_FROM_EMAIL", "");
  fetchMock.mockImplementation(async () => Response.json({ emailId: "email-123" }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

describe("useSend reminder delivery", () => {
  it("sends reminders through useSend and escapes user-provided HTML", async () => {
    await sendReminderEmail({
      to: "owner@example.com",
      jobName: "<b>Reminder</b>",
      schedule: "0 0 * * *",
    });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://franceschini.email/api/v1/emails");
    expect(options).toMatchObject({ method: "POST" });
    const headers = new Headers(options?.headers);
    expect(headers.get("Authorization")).toBeTruthy();
    expect(headers.get("Content-Type")).toBe("application/json");
    const message = JSON.parse(String(options?.body));
    expect(message.subject).toBe("Reminder: <b>Reminder</b>");
    expect(message.html).toContain("&lt;b&gt;Reminder&lt;/b&gt;");
    expect(message.html).not.toContain("<b>Reminder</b>");
  });

  it("rejects missing keys without making a request", async () => {
    vi.stubEnv("USESEND_API_KEY", "");
    await expect(
      sendReminderEmail({
        to: "owner@example.com",
        jobName: "Reminder",
        schedule: "* * * * *",
      }),
    ).rejects.toThrow("USESEND_API_KEY");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
