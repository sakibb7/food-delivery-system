import { db } from "./src/db/index.js";
import { restaurantsTable } from "./src/db/schema/restaurantSchema.js";
import { eq } from "drizzle-orm";

async function main() {
  const [restaurant] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, 1)).limit(1);
  console.log("Restaurant stats:", { rating: restaurant.rating, totalReviews: restaurant.totalReviews });
  process.exit(0);
}
main();
