import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./userSchema.js";

export const ticketTypeEnum = pgEnum("ticket_type", [
  "order_issue",
  "payment_issue",
  "account_management",
  "bug_report",
  "general_inquiry",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "resolved",
]);

export const messageSenderTypeEnum = pgEnum("message_sender_type", [
  "user",
  "staff",
]);

export const supportTicketsTable = pgTable("support_tickets", {
  id: serial("id").primaryKey(),

  ticketNumber: varchar("ticket_number", { length: 20 }).notNull().unique(),

  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  subject: varchar("subject", { length: 500 }).notNull(),

  type: ticketTypeEnum().notNull(),

  status: ticketStatusEnum().default("open").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const supportMessagesTable = pgTable("support_messages", {
  id: serial("id").primaryKey(),

  ticketId: integer("ticket_id")
    .notNull()
    .references(() => supportTicketsTable.id, { onDelete: "cascade" }),

  senderType: messageSenderTypeEnum("sender_type").notNull(),

  senderId: integer("sender_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  text: text("text").notNull(),
  attachmentUrl: varchar("attachment_url", { length: 1000 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
