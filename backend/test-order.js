import { db } from "./src/db/index.js";
import { ordersTable } from "./src/db/schema/orderSchema.js";
async function test() {
  const [order] = await db.insert(ordersTable).values({
    userId: 4,
    restaurantId: 1,
    status: "pending",
    paymentMethod: "cod",
    paymentStatus: "pending",
    deliveryAddress: "Test",
    deliveryPhone: "123",
    deliveryLat: "23.8116888",
    deliveryLng: "90.4172444",
    subtotal: "10.00",
    deliveryFee: "0.00",
    tax: "0.00",
    total: "10.00",
  }).returning();
  console.log("Inserted order:", order.id, order.deliveryLat, order.deliveryLng);
  process.exit(0);
}
test().catch(console.error);
