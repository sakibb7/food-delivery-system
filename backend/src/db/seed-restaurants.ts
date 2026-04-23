import { db } from "./index.js";
import { usersTable } from "./schema/userSchema.js";
import { restaurantsTable } from "./schema/restaurantSchema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const cuisines = ["Fast Food", "Italian", "Chinese", "Indian", "Mexican", "Thai", "Japanese", "Healthy", "Dessert", "Beverages"];
const cities = ["Dhaka", "Chittagong", "Sylhet"];
const areas = ["Gulshan", "Banani", "Dhanmondi", "Mirpur", "Uttara", "Mohakhali", "Badda"];

function generateFakeData(count: number, passwordHash: string) {
  const data = [];
  for (let i = 1; i <= count; i++) {
    const cuisine = cuisines[i % cuisines.length]!;
    const city = cities[i % cities.length]!;
    const area = areas[i % areas.length]!;
    
    data.push({
      user: {
        firstName: `Owner`,
        lastName: `${i}`,
        email: `owner${i}@tomato.com`,
        phone: `0170000${i.toString().padStart(4, '0')}`,
        passwordHash,
        role: "restaurant" as const,
        status: "active" as const,
        provider: "local" as const,
      },
      restaurant: {
        name: `Restaurant ${i} (${cuisine})`,
        slug: `restaurant-${i}-${cuisine.toLowerCase().replace(" ", "-")}`,
        description: `Experience the best ${cuisine} in ${area}, ${city}`,
        address: `${i * 10} Food Street, ${area}`,
        city: city,
        area: area,
        cuisine: cuisine,
        deliveryTime: `${20 + (i % 3) * 10}-${35 + (i % 3) * 10} min`,
        isOpen: true,
        isActive: true,
        isVerified: true,
        status: "approved",
        deliveryFee: `${30 + (i % 5) * 10}`,
        minOrderAmount: `${100 + (i % 5) * 50}`,
      }
    });
  }
  return data;
}

async function seed() {
  console.log("Seeding 50 restaurant owners and restaurants...");
  try {
    const passwordHash = await bcrypt.hash("password123", 10);
    const ownersData = generateFakeData(50, passwordHash);

    for (const data of ownersData) {
      // Check if user exists
      let user = await db.select().from(usersTable).where(eq(usersTable.email, data.user.email)).limit(1);
      
      let currentUserId: number;

      if (user.length === 0) {
        const [newUser] = await db.insert(usersTable).values(data.user).returning();
        if (!newUser) throw new Error("Failed to create user");
        currentUserId = newUser.id;
        console.log(`Created user: ${data.user.email}`);
      } else {
        if (!user[0]) throw new Error("User array is empty");
        currentUserId = user[0].id;
        console.log(`User already exists: ${data.user.email}`);
      }

      // Check if restaurant exists
      let restaurant = await db.select().from(restaurantsTable).where(eq(restaurantsTable.slug, data.restaurant.slug)).limit(1);

      if (restaurant.length === 0) {
        await db.insert(restaurantsTable).values({
          ...data.restaurant,
          ownerId: currentUserId
        });
        console.log(`Created restaurant: ${data.restaurant.name}`);
      } else {
        console.log(`Restaurant already exists: ${data.restaurant.name}`);
      }
    }

    console.log("Restaurant owners and restaurants seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding restaurant owners:", error);
    process.exit(1);
  }
}

seed();
