import {
  pgTable,
  pgEnum,
  serial,
  integer,
  decimal,
  text,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { restaurantsTable } from "./restaurantSchema.js";

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "processing",
  "paid",
  "failed",
]);

export const restaurantPayoutsTable = pgTable("restaurant_payouts", {
  id: serial("id").primaryKey(),

  restaurantId: integer("restaurant_id")
    .notNull()
    .references(() => restaurantsTable.id, { onDelete: "cascade" }),

  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),

  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),

  status: payoutStatusEnum("status").default("pending").notNull(),

  // Bank details (snapshot at payout time)
  bankName: varchar("bank_name", { length: 255 }).notNull(),
  accountNumber: varchar("account_number", { length: 100 }).notNull(),
  accountHolderName: varchar("account_holder_name", { length: 255 }).notNull(),

  transactionRef: varchar("transaction_ref", { length: 255 }),
  adminNotes: text("admin_notes"),

  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
