import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "banned",
]);

export const roles = pgEnum("user_role", [
  "admin",
  "restaurant",
  "rider",
  "user",
]);

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  firstName: varchar({ length: 255 }).notNull(),
  lastName: varchar({ length: 255 }).notNull(),

  username: varchar({ length: 255 }).notNull().unique(),
  avatar: varchar({ length: 255 }),

  passwordHash: varchar({ length: 255 }),

  email: varchar({ length: 255 }).notNull().unique(),
  phone: varchar({ length: 255 }).unique(),

  emailVerifiedAt: timestamp({ mode: "date" }),
  phoneVerifiedAt: timestamp({ mode: "date" }),

  address: varchar({ length: 255 }),
  city: varchar({ length: 255 }),
  country: varchar({ length: 255 }),
  zipcode: varchar({ length: 20 }),

  fcmToken: varchar({ length: 255 }),

  status: userStatusEnum().default("active"),

  role: roles().default("user"),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),

  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
