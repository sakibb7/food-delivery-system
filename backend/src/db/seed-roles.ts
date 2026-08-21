import { db } from "./index.js";
import { adminRolesTable } from "./schema/roleSchema.js";
import { eq } from "drizzle-orm";

async function seedRoles() {
  console.log("Seeding system roles...");

  const systemRoles = [
    {
      name: "Super Admin",
      description: "Full system access",
      permissions: [
        "view_orders",
        "manage_orders",
        "view_users",
        "manage_users",
        "manage_restaurants",
        "view_financials",
        "manage_settings",
        "edit_admins",
        "delete_admins",
      ],
      isSystem: true,
    },
    {
      name: "Admin",
      description: "System administrator",
      permissions: [
        "view_orders",
        "manage_orders",
        "view_users",
        "manage_users",
        "manage_restaurants",
        "view_financials",
        "edit_admins",
        "delete_admins",
      ],
      isSystem: true,
    },
    {
      name: "Manager",
      description: "Oversees daily operations",
      permissions: [
        "view_orders",
        "manage_orders",
        "view_users",
        "manage_restaurants",
        "view_financials",
      ],
      isSystem: true,
    },
    {
      name: "Support Agent",
      description: "Handles customer and order issues",
      permissions: ["view_orders", "manage_orders", "view_users"],
      isSystem: true,
    },
  ];

  for (const role of systemRoles) {
    const existing = await db
      .select()
      .from(adminRolesTable)
      .where(eq(adminRolesTable.name, role.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(adminRolesTable).values(role);
      console.log(`Created role: ${role.name}`);
    } else {
      // Update permissions if it exists
      await db
        .update(adminRolesTable)
        .set({ permissions: role.permissions, isSystem: role.isSystem })
        .where(eq(adminRolesTable.name, role.name));
      console.log(`Updated role: ${role.name}`);
    }
  }

  console.log("Role seeding complete.");
  process.exit(0);
}

seedRoles().catch((err) => {
  console.error("Error seeding roles:", err);
  process.exit(1);
});
