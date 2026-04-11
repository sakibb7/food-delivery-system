CREATE TYPE "public"."user_role" AS ENUM('admin', 'restaurent', 'rider', 'user');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'banned');--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"firstName" varchar(255) NOT NULL,
	"lastName" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"avatar" varchar(255),
	"passwordHash" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(255),
	"emailVerifiedAt" timestamp,
	"phoneVerifiedAt" timestamp,
	"address" varchar(255),
	"city" varchar(255),
	"country" varchar(255),
	"zipcode" varchar(20),
	"fcmToken" varchar(255),
	"status" "user_status" DEFAULT 'active',
	"role" "user_role" DEFAULT 'user',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" integer NOT NULL,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
