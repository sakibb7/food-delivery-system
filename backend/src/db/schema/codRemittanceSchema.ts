import {
  pgTable,
  pgEnum,
  serial,
  integer,
  decimal,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./userSchema.js";
import { ordersTable } from "./orderSchema.js";

export const codRemittanceStatusEnum = pgEnum("cod_remittance_status", [
  "pending",
  "remitted",
  "confirmed",
]);

export const codRemittancesTable = pgTable("cod_remittances", {
  id: serial("id").primaryKey(),

  riderId: integer("rider_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  orderId: integer("order_id")
    .notNull()
    .unique()
    .references(() => ordersTable.id, { onDelete: "cascade" }),

  amountCollected: decimal("amount_collected", { precision: 10, scale: 2 }).notNull(),
  amountToRemit: decimal("amount_to_remit", { precision: 10, scale: 2 }).notNull(),

  status: codRemittanceStatusEnum("status").default("pending").notNull(),

  remittedAt: timestamp("remitted_at"),
  confirmedAt: timestamp("confirmed_at"),
  adminNotes: text("admin_notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
