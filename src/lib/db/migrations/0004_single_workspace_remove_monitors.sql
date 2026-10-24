BEGIN;
--> statement-breakpoint
ALTER TABLE "alert_channels" DROP CONSTRAINT "alert_channels_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "scheduled_jobs" DROP CONSTRAINT "scheduled_jobs_project_id_projects_id_fk";
--> statement-breakpoint
UPDATE "alert_channels" AS channel
SET "project_id" = project."user_id"
FROM "projects" AS project
WHERE channel."project_id" = project."id";
--> statement-breakpoint
UPDATE "scheduled_jobs" AS job
SET "project_id" = project."user_id"
FROM "projects" AS project
WHERE job."project_id" = project."id";
--> statement-breakpoint
ALTER TABLE "alert_channels" RENAME COLUMN "project_id" TO "user_id";
--> statement-breakpoint
ALTER TABLE "scheduled_jobs" RENAME COLUMN "project_id" TO "user_id";
--> statement-breakpoint
ALTER TABLE "alert_channels" ADD CONSTRAINT "alert_channels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
DROP TABLE "alert_queue";
--> statement-breakpoint
DROP TABLE "pings";
--> statement-breakpoint
DROP TABLE "monitors";
--> statement-breakpoint
DROP TABLE "projects";
--> statement-breakpoint
DROP TYPE "monitor_status";
--> statement-breakpoint
DROP TYPE "alert_status";
--> statement-breakpoint
COMMIT;