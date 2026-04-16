import { db } from "./index.js";
import { usersTable } from "./schema/userSchema.js";
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
    });
    console.log("Admin account seeded successfully: admin@tomato.com / admin123");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin account:", error);
    process.exit(1);
  }
}

seed();
