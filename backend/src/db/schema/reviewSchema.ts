import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./userSchema.js";
import { ordersTable } from "./orderSchema.js";
import { restaurantsTable } from "./restaurantSchema.js";

export const restaurantReviewsTable = pgTable("restaurant_reviews", {
  id: serial("id").primaryKey(),

  orderId: integer("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" })
    .unique(), // one review per order

  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  restaurantId: integer("restaurant_id")
    .notNull()
    .references(() => restaurantsTable.id, { onDelete: "cascade" }),

  rating: integer("rating").notNull(), // 1-5

  comment: text("comment"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const riderReviewsTable = pgTable("rider_reviews", {
  id: serial("id").primaryKey(),

  orderId: integer("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" })
    .unique(), // one review per order

  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  riderId: integer("rider_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  rating: integer("rating").notNull(), // 1-5

  comment: text("comment"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
