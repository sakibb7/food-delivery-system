import { db } from "./index.js";
import { usersTable } from "./schema/userSchema.js";
import { settingsTable } from "./schema/settingsSchema.js";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding admin account...");
  try {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await db.insert(usersTable).values({
      firstName: "Super",
      lastName: "Admin",
      email: "admin@tomato.com",
      passwordHash,
      role: "admin",
      status: "active",
      provider: "local",
    }).onConflictDoNothing({ target: usersTable.email });
    console.log("Admin account seeded successfully: admin@tomato.com / admin123");

    console.log("Seeding default settings...");
    await db.insert(settingsTable).values([
      // General Settings
      { key: "company_name", value: "Tomato Food", type: "string" },
      { key: "support_email", value: "support@tomato.com", type: "string" },
      { key: "website_url", value: "https://tomato.com", type: "string" },
      { key: "support_phone", value: "+880123456789", type: "string" },
      { key: "timezone", value: "Asia/Dhaka", type: "string" },
      { key: "app_url", value: "https://app.tomato.com", type: "string" },
      { key: "company_address", value: "123 Food Street, City", type: "string" },
      // System Configuration
      { key: "force_secure_password", value: "true", type: "boolean" },
      { key: "kyc_verification", value: "false", type: "boolean" },
      { key: "phone_verification", value: "true", type: "boolean" },
      { key: "email_verification", value: "false", type: "boolean" },
      { key: "maintenance_mode", value: "false", type: "boolean" },
      // Commission & Fees
      { key: "platform_commission_rate", value: "15", type: "number" },
      { key: "delivery_base_fee", value: "40", type: "number" },
      { key: "delivery_fee_per_km", value: "10", type: "number" },
      { key: "tax_rate", value: "5", type: "number" },
    ]).onConflictDoNothing();
    console.log("Default settings seeded successfully.");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin account:", error);
    process.exit(1);
  }
}

seed();
