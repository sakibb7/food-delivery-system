import { pgTable, uuid, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";

export const VerificationCodeType = pgEnum("verification_code", [
  "email_verification",
  "password_reset",
]);

export const verificationTable = pgTable("verifications", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: integer().notNull(),
  type: VerificationCodeType().notNull(),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});
