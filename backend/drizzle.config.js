import { defineConfig } from "drizzle-kit";
import "dotenv/config";
export default defineConfig({
  out: "./drizzle",
  schema: [
    "./src/db/schema/userSchema.ts",
    "./src/db/schema/sessionSchema.ts",
    "./src/db/schema/verificationSchema.ts",
  ],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
