import {
  boolean,
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const adminRolesTable = pgTable("admin_roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),
  
  permissions: jsonb("permissions").notNull().$type<string[]>(),

  isSystem: boolean("is_system").default(false).notNull(),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),

  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
