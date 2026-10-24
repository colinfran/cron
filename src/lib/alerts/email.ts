import { z } from "zod";

const sendResponseSchema = z.object({ emailId: z.string().min(1) });

async function sendEmail(message: { to: string; subject: string; html: string }) {
  const apiKey = process.env.USESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email delivery requires USESEND_API_KEY");
  }

  const baseUrl = process.env.USESEND_BASE_URL || "https://franceschini.email";
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/v1/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.USESEND_FROM_EMAIL || "Cron <no-reply@colinfran.com>",
      ...message,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`useSend email delivery failed (HTTP ${response.status}): ${(await response.text()).slice(0, 500)}`);
  }

  const result = sendResponseSchema.safeParse(await response.json());
  if (!result.success) {
    throw new Error("useSend returned an invalid send-email response: expected emailId");
  }
  return result.data;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    };
    return entities[character];
  });
}

export async function sendReminderEmail({
  to, jobName, schedule,
}: {
  to: string; jobName: string; schedule: string;
}) {
  return sendEmail({
    to,
    subject: `Reminder: ${jobName}`,
    html: `<div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h1>${escapeHtml(jobName)}</h1>
      <p>Your scheduled reminder from Cron.</p>
      <p>Schedule: <code>${escapeHtml(schedule)}</code></p>
    </div>`,
  });
}
