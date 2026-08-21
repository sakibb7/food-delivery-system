import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";

export const sessionsTable = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: integer().notNull(),
  // optional: reference users table
  // .references(() => usersTable.id)
  userAgent: text("user_agent"),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),

  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});
