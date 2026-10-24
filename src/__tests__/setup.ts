import { afterAll, afterEach } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  alertChannels,
  scheduledJobs,
  scheduledRuns,
} from "@/lib/db/schema";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://cronpulse:cronpulse@localhost:5432/cronpulse_test";

const pool = new Pool({ connectionString: TEST_DATABASE_URL });
export const testDb = drizzle({ client: pool });

afterEach(async () => {
  await testDb.delete(scheduledRuns);
  await testDb.delete(scheduledJobs);
  await testDb.delete(alertChannels);
  await testDb.delete(sessions);
  await testDb.delete(accounts);
  await testDb.delete(verificationTokens);
  await testDb.delete(users);
});

afterAll(async () => {
  await pool.end();
});
