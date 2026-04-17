ALTER TABLE "restaurants" ALTER COLUMN "is_active" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "is_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "is_featured" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "status" varchar(20) DEFAULT 'pending';