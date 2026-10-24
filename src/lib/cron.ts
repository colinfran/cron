import cron from "node-cron";
import { executeScheduledJobs } from "@/lib/scheduler/execute";

let initialized = false;

export function startCronJobs() {
  if (initialized) return;
  initialized = true;

  // Execute scheduled jobs every minute
  cron.schedule("* * * * *", async () => {
    try {
      await executeScheduledJobs();
    } catch (error) {
      console.error("[cron] Error executing scheduled jobs:", error);
    }
  });

  console.log("[cron] Background jobs started — checking every minute");
}
