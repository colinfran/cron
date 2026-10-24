import { describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import { testDb } from "./setup";
import { users, alertChannels } from "@/lib/db/schema";
import { createTestUser } from "./helpers";
import { createId } from "@paralleldrive/cuid2";

describe("Auth - OAuth user persistence", () => {
  it("stores an OAuth user without a password", async () => {
    const email = `oauth-${createId()}@example.com`;

    const user = await testDb
      .insert(users)
      .values({
        id: createId(),
        email,
        name: "New User",
      })
      .returning()
      .then((rows) => rows[0]);

    expect(user).toBeDefined();
    expect(user.email).toBe(email);
    expect(user.name).toBe("New User");
    expect(user.password).toBeNull();
  });

  it("supports the default email channel created on first OAuth sign-in", async () => {
    const user = await createTestUser();

    await testDb.insert(alertChannels).values({
      id: createId(),
      userId: user.id,
      type: "email",
      config: { email: user.email },
    });

    const channels = await testDb
      .select()
      .from(alertChannels)
      .where(eq(alertChannels.userId, user.id));
    expect(channels).toHaveLength(1);
    expect(channels[0].type).toBe("email");
    expect((channels[0].config as { email: string }).email).toBe(user.email);
  });

  it("should reject duplicate email", async () => {
    const email = `dupe-${createId()}@example.com`;
    await createTestUser({ email });

    // Attempt to insert duplicate
    await expect(
      testDb
        .insert(users)
        .values({
          id: createId(),
          email,
          name: "Duplicate User",
          password: "hashed",
        })
    ).rejects.toThrow();
  });

});
