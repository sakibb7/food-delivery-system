import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./userSchema.js";

export const addressesTable = pgTable("addresses", {
  id: serial("id").primaryKey(),

  // Relationship
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  // Label (Home, Work, Other)
  label: varchar("label", { length: 50 }).notNull().default("Home"),

  // Address fields
  address: text("address").notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }),
  country: varchar("country", { length: 255 }).notNull(),
  zipcode: varchar("zipcode", { length: 20 }),

  // Coordinates
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),

  // Default flag
  isDefault: boolean("is_default").default(false).notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
