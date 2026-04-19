import { defineConfig } from "drizzle-kit";
import "dotenv/config";
export default defineConfig({
  out: "./drizzle",
  schema: [
    "./src/db/schema/userSchema.ts",
    "./src/db/schema/sessionSchema.ts",
    "./src/db/schema/verificationSchema.ts",
    "./src/db/schema/restaurantSchema.ts",
    "./src/db/schema/menuItemSchema.ts",
    "./src/db/schema/orderSchema.ts",
    "./src/db/schema/addressSchema.ts",
    "./src/db/schema/riderProfileSchema.ts",
  ],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
