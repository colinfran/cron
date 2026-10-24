import { testDb } from "./setup";
import { users, alertChannels } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";

export async function createTestUser(
  overrides: { email?: string; name?: string; password?: string } = {},
) {
  const email = overrides.email ?? `test-${createId()}@example.com`;
  const hashedPassword = await bcrypt.hash(overrides.password ?? "password123", 12);

  const user = await testDb
    .insert(users)
    .values({
      id: createId(),
      email,
      name: overrides.name ?? "Test User",
      password: hashedPassword,
    })
    .returning()
    .then((rows) => rows[0]);

  return user;
}

export async function createTestAlertChannel(
  userId: string,
  overrides: {
    type?: "email" | "slack" | "discord" | "telegram" | "webhook";
    config?: Record<string, unknown>;
    enabled?: boolean;
  } = {},
) {
  const channel = await testDb
    .insert(alertChannels)
    .values({
      id: createId(),
      userId,
      type: overrides.type ?? "email",
      config: overrides.config ?? { email: "test@example.com" },
      enabled: overrides.enabled ?? true,
    })
    .returning()
    .then((rows) => rows[0]);

  return channel;
}
