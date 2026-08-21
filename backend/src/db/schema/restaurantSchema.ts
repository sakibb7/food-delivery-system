import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { usersTable } from "./userSchema.js";

export const restaurantsTable = pgTable("restaurants", {
  id: serial("id").primaryKey(),

  // Relationship
  ownerId: integer("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  // Basic Info
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),

  // Branding
  logo: varchar("logo", { length: 255 }),
  coverImage: varchar("cover_image", { length: 255 }),

  // Contact Info
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),

  // Address
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  zipcode: varchar("zipcode", { length: 20 }),
  area: varchar("area", { length: 100 }), // optional (like Dhanmondi, Gulshan)
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),

  // Business Info
  cuisine: varchar("cuisine", { length: 255 }),
  deliveryTime: varchar("delivery_time", { length: 100 }),
  isOpen: boolean("is_open").default(true),
  isActive: boolean("is_active").default(false),
  isVerified: boolean("is_verified").default(false),
  isFeatured: boolean("is_featured").default(false),
  status: varchar("status", { length: 20 }).default("pending"),

  // Delivery Info
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default(
    "0",
  ),
  minOrderAmount: decimal("min_order_amount", {
    precision: 10,
    scale: 2,
  }).default("0"),

  // Ratings
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
