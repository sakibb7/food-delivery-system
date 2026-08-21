import { db } from "./index.js";
import { zonesTable } from "./schema/zoneSchema.js";

async function seedZones() {
  console.log("Seeding operational zones...");
  try {
    await db.insert(zonesTable).values([
      {
        name: "Dhaka Central",
        description: "Core service area in Dhaka city",
        status: "active",
        coordinates: [
          { lat: 23.750, lng: 90.390 },
          { lat: 23.760, lng: 90.410 },
          { lat: 23.740, lng: 90.420 },
          { lat: 23.730, lng: 90.400 }
        ],
      },
      {
        name: "Uttara Zone",
        description: "Northern residential area",
        status: "active",
        coordinates: [
          { lat: 23.860, lng: 90.380 },
          { lat: 23.880, lng: 90.400 },
          { lat: 23.870, lng: 90.420 },
          { lat: 23.850, lng: 90.410 }
        ],
      },
      {
        name: "Gulshan-Banani",
        description: "Premium commercial and residential zone",
        status: "active",
        coordinates: [
          { lat: 23.780, lng: 90.400 },
          { lat: 23.800, lng: 90.420 },
          { lat: 23.790, lng: 90.430 },
          { lat: 23.770, lng: 90.410 }
        ],
      }
    ]);
    console.log("Zones seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding zones:", error);
    process.exit(1);
  }
}

seedZones();
