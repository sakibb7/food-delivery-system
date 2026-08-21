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
import { restaurantsTable } from "./restaurantSchema.js";

export const menuItemsTable = pgTable("menu_items", {
  id: serial("id").primaryKey(),

  // Relationship
  restaurantId: integer("restaurant_id")
    .notNull()
    .references(() => restaurantsTable.id, { onDelete: "cascade" }),

  // Item Info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  image: varchar("image", { length: 255 }),

  // Availability
  isAvailable: boolean("is_available").default(true),

  // Ordering
  sortOrder: integer("sort_order").default(0),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
