import {
  pgTable,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const settingsTable = pgTable("settings", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'string', 'number', 'boolean'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
