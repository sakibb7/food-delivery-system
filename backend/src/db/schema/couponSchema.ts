import {
  boolean,
  integer,
  numeric,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const couponsTable = pgTable("coupons", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  code: varchar("code", { length: 50 }).unique().notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "percentage" | "fixed"
  
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  maxDiscount: numeric("max_discount", { precision: 10, scale: 2 }), // For percentage type
  minPurchase: numeric("min_purchase", { precision: 10, scale: 2 }),
  
  expiryDate: timestamp("expiry_date", { mode: "date" }).notNull(),
  
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0).notNull(),
  
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
