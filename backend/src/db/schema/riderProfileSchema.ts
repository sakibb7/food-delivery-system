import {
  pgTable,
  pgEnum,
  integer,
  varchar,
  boolean,
  decimal,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./userSchema.js";

export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "bicycle",
  "scooter",
  "car",
]);

export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);

export const riderProfilesTable = pgTable("rider_profiles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  vehicleType: vehicleTypeEnum("vehicle_type").notNull(),
  vehicleMakeModel: varchar("vehicle_make_model", { length: 255 }).notNull(),
  vehicleRegistration: varchar("vehicle_registration", { length: 255 }),

  drivingLicenseUrl: varchar("driving_license_url", { length: 1024 }),
  vehicleRegistrationUrl: varchar("vehicle_registration_url", { length: 1024 }),

  isOnline: boolean("is_online").default(false).notNull(),

  currentLat: decimal("current_lat", { precision: 10, scale: 8 }),
  currentLng: decimal("current_lng", { precision: 10, scale: 8 }),

  approvalStatus: approvalStatusEnum("approval_status")
    .default("pending")
    .notNull(),

  // Ratings
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
