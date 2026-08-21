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
import { usersTable } from "./userSchema.js";

export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "pending",
  "approved",
  "rejected",
  "paid",
]);

export const withdrawalRequestsTable = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),

  riderId: integer("rider_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),

  status: withdrawalStatusEnum("status").default("pending").notNull(),

  // Bank transfer details
  bankName: varchar("bank_name", { length: 255 }).notNull(),
  accountNumber: varchar("account_number", { length: 100 }).notNull(),
  accountHolderName: varchar("account_holder_name", { length: 255 }).notNull(),
  branchName: varchar("branch_name", { length: 255 }),

  // Optional notes from rider or admin
  riderNotes: text("rider_notes"),
  adminNotes: text("admin_notes"),

  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
