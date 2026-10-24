import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { alertChannels } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const channelSchemas = {
  email: z.object({
    type: z.literal("email"),
    email: z.string().email("Invalid email address"),
  }),
  discord: z.object({
    type: z.literal("discord"),
    webhookUrl: z.string().url().startsWith("https://discord.com/api/webhooks/", "Must be a Discord webhook URL"),
  }),
  slack: z.object({
    type: z.literal("slack"),
    webhookUrl: z.string().url().startsWith("https://hooks.slack.com/", "Must be a Slack webhook URL"),
  }),
  telegram: z.object({
    type: z.literal("telegram"),
    botToken: z.string().min(1, "Bot token is required"),
    chatId: z.string().min(1, "Chat ID is required"),
  }),
  webhook: z.object({
    type: z.literal("webhook"),
    url: z.string().url("Must be a valid URL"),
    label: z.string().max(50).optional(),
  }),
};

const createChannelSchema = z.discriminatedUnion("type", [
  channelSchemas.email,
  channelSchemas.discord,
  channelSchemas.slack,
  channelSchemas.telegram,
  channelSchemas.webhook,
]);

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createChannelSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { type } = parsed.data;

  // Check for duplicates within same type
  const existing = await db
    .select()
    .from(alertChannels)
    .where(
      and(
        eq(alertChannels.userId, session.user.id),
        eq(alertChannels.type, type),
      ),
    );

  // Build config and check duplicates based on type
  let config: Record<string, string>;

  const d = parsed.data;

  switch (d.type) {
    case "email": {
      config = { email: d.email };
      const duplicate = existing.find(
        (ch) => (ch.config as { email: string }).email === d.email,
      );
      if (duplicate) {
        return NextResponse.json(
          { error: "This email is already configured" },
          { status: 409 },
        );
      }
      break;
    }
    case "discord": {
      config = { webhookUrl: d.webhookUrl };
      const duplicate = existing.find(
        (ch) =>
          (ch.config as { webhookUrl: string }).webhookUrl === d.webhookUrl,
      );
      if (duplicate) {
        return NextResponse.json(
          { error: "This Discord webhook is already configured" },
          { status: 409 },
        );
      }
      break;
    }
    case "slack": {
      config = { webhookUrl: d.webhookUrl };
      const duplicate = existing.find(
        (ch) =>
          (ch.config as { webhookUrl: string }).webhookUrl === d.webhookUrl,
      );
      if (duplicate) {
        return NextResponse.json(
          { error: "This Slack webhook is already configured" },
          { status: 409 },
        );
      }
      break;
    }
    case "telegram": {
      config = { botToken: d.botToken, chatId: d.chatId };
      const duplicate = existing.find(
        (ch) => (ch.config as { chatId: string }).chatId === d.chatId,
      );
      if (duplicate) {
        return NextResponse.json(
          { error: "This Telegram chat is already configured" },
          { status: 409 },
        );
      }
      break;
    }
    case "webhook": {
      config = { url: d.url };
      if (d.label) config.label = d.label;
      const duplicate = existing.find(
        (ch) => (ch.config as { url: string }).url === d.url,
      );
      if (duplicate) {
        return NextResponse.json(
          { error: "This webhook URL is already configured" },
          { status: 409 },
        );
      }
      break;
    }
  }

  const channel = await db
    .insert(alertChannels)
    .values({
      userId: session.user.id,
      type,
      config,
    })
    .returning()
    .then((rows) => rows[0]);

  return NextResponse.json(channel, { status: 201 });
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const channels = await db
    .select()
    .from(alertChannels)
    .where(eq(alertChannels.userId, session.user.id));

  return NextResponse.json(channels);
}
