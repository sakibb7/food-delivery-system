CREATE TYPE "public"."auth_provider" AS ENUM('local', 'google');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider" "auth_provider" DEFAULT 'local';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider_id" varchar(255);