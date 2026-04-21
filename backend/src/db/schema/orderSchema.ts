import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./userSchema.js";
import { restaurantsTable } from "./restaurantSchema.js";
import { menuItemsTable } from "./menuItemSchema.js";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cod",
  "card",
  "mobile_banking",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),

  // Relationships
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  restaurantId: integer("restaurant_id")
    .notNull()
    .references(() => restaurantsTable.id, { onDelete: "cascade" }),
  riderId: integer("rider_id")
    .references(() => usersTable.id, { onDelete: "set null" }),

  // Status
  status: orderStatusEnum().default("pending").notNull(),

  // Payment
  paymentMethod: paymentMethodEnum("payment_method").default("cod").notNull(),
  paymentStatus: paymentStatusEnum("payment_status")
    .default("pending")
    .notNull(),

  // Delivery Info (snapshot at order time)
  deliveryAddress: text("delivery_address").notNull(),
  deliveryPhone: varchar("delivery_phone", { length: 20 }).notNull(),
  deliveryLat: decimal("delivery_lat", { precision: 10, scale: 7 }),
  deliveryLng: decimal("delivery_lng", { precision: 10, scale: 7 }),

  // Pricing
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  riderEarnings: decimal("rider_earnings", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),

  // Extra
  notes: text("notes"),
  estimatedDeliveryTime: varchar("estimated_delivery_time", { length: 100 }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  pickedUpAt: timestamp("picked_up_at"),
  deliveredAt: timestamp("delivered_at"),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),

  // Relationships
  orderId: integer("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  menuItemId: integer("menu_item_id")
    .notNull()
    .references(() => menuItemsTable.id),

  // Snapshot of item at order time
  name: varchar("name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
