CREATE TYPE "public"."verification_code" AS ENUM('email_verification', 'password_reset');--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" integer NOT NULL,
	"type" "verification_code" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
