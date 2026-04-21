import { db } from "../db/index.js";
import { riderProfilesTable } from "../db/schema/riderProfileSchema.js";
import { ordersTable, orderItemsTable } from "../db/schema/orderSchema.js";
import { usersTable } from "../db/schema/userSchema.js";
import { restaurantsTable } from "../db/schema/restaurantSchema.js";
import { eq, and, isNull } from "drizzle-orm";

export const getRiderProfile = async (userId: number) => {
  const [profile] = await db.select()
    .from(riderProfilesTable)
    .where(eq(riderProfilesTable.userId, userId))
    .limit(1);
  return profile;
};

export const createOrUpdateRiderProfile = async (userId: number, data: any) => {
  const existing = await getRiderProfile(userId);
  if (existing) {
    return await db.update(riderProfilesTable)
      .set(data)
      .where(eq(riderProfilesTable.userId, userId))
      .returning();
  } else {
    // Make sure user role is rider
    await db.update(usersTable).set({ role: "rider" }).where(eq(usersTable.id, userId));
    return await db.insert(riderProfilesTable)
      .values({ ...data, userId })
      .returning();
  }
};

export const updateRiderLocation = async (userId: number, lat: number, lng: number) => {
  return await db.update(riderProfilesTable)
    .set({ currentLat: lat.toString() as any, currentLng: lng.toString() as any })
    .where(eq(riderProfilesTable.userId, userId))
    .returning();
};

export const updateRiderOnlineStatus = async (userId: number, isOnline: boolean) => {
  return await db.update(riderProfilesTable)
    .set({ isOnline })
    .where(eq(riderProfilesTable.userId, userId))
    .returning();
};

export const getAvailableOrders = async () => {
  return await db.select({
      id: ordersTable.id,
      status: ordersTable.status,
      paymentMethod: ordersTable.paymentMethod,
      paymentStatus: ordersTable.paymentStatus,
      deliveryAddress: ordersTable.deliveryAddress,
      deliveryPhone: ordersTable.deliveryPhone,
      deliveryLat: ordersTable.deliveryLat,
      deliveryLng: ordersTable.deliveryLng,
      subtotal: ordersTable.subtotal,
      deliveryFee: ordersTable.deliveryFee,
      tax: ordersTable.tax,
      total: ordersTable.total,
      notes: ordersTable.notes,
      estimatedDeliveryTime: ordersTable.estimatedDeliveryTime,
      createdAt: ordersTable.createdAt,
      restaurantId: ordersTable.restaurantId,
      restaurantName: restaurantsTable.name,
      restaurantLogo: restaurantsTable.logo,
      restaurantLat: restaurantsTable.latitude,
      restaurantLng: restaurantsTable.longitude,
    })
    .from(ordersTable)
    .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
    .where(and(
      eq(ordersTable.status, "ready_for_pickup"),
      isNull(ordersTable.riderId)
    ));
};

export const acceptOrder = async (userId: number, orderId: number) => {
  // We use a fixed earnings amount for now as requested
  await db.update(ordersTable)
    .set({ 
      riderId: userId, 
      status: "out_for_delivery",
      riderEarnings: "5.00" // Fixed earning per order
    })
    .where(eq(ordersTable.id, orderId));

  // Return the full order detail with restaurant and delivery coordinates
  return await getOrderDetail(orderId);
};

export const pickupOrder = async (userId: number, orderId: number) => {
  return await db.update(ordersTable)
    .set({ pickedUpAt: new Date(), status: "out_for_delivery" })
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.riderId, userId)))
    .returning();
};

export const deliverOrder = async (userId: number, orderId: number) => {
  return await db.update(ordersTable)
    .set({ status: "delivered", deliveredAt: new Date() })
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.riderId, userId)))
    .returning();
};

export const getRiderHistory = async (userId: number) => {
  return await db.select({
      id: ordersTable.id,
      status: ordersTable.status,
      paymentMethod: ordersTable.paymentMethod,
      paymentStatus: ordersTable.paymentStatus,
      deliveryAddress: ordersTable.deliveryAddress,
      deliveryPhone: ordersTable.deliveryPhone,
      total: ordersTable.total,
      createdAt: ordersTable.createdAt,
      deliveredAt: ordersTable.deliveredAt,
      riderEarnings: ordersTable.riderEarnings,
      restaurantName: restaurantsTable.name,
      restaurantLogo: restaurantsTable.logo,
    })
    .from(ordersTable)
    .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
    .where(and(
      eq(ordersTable.riderId, userId),
      eq(ordersTable.status, "delivered")
    ));
};

export const getOrderDetail = async (orderId: number) => {
  const [order] = await db.select({
      id: ordersTable.id,
      status: ordersTable.status,
      paymentMethod: ordersTable.paymentMethod,
      paymentStatus: ordersTable.paymentStatus,
      deliveryAddress: ordersTable.deliveryAddress,
      deliveryPhone: ordersTable.deliveryPhone,
      deliveryLat: ordersTable.deliveryLat,
      deliveryLng: ordersTable.deliveryLng,
      subtotal: ordersTable.subtotal,
      deliveryFee: ordersTable.deliveryFee,
      tax: ordersTable.tax,
      total: ordersTable.total,
      notes: ordersTable.notes,
      estimatedDeliveryTime: ordersTable.estimatedDeliveryTime,
      riderEarnings: ordersTable.riderEarnings,
      createdAt: ordersTable.createdAt,
      pickedUpAt: ordersTable.pickedUpAt,
      deliveredAt: ordersTable.deliveredAt,
      riderId: ordersTable.riderId,
      restaurantId: ordersTable.restaurantId,
      restaurantName: restaurantsTable.name,
      restaurantLogo: restaurantsTable.logo,
      restaurantLat: restaurantsTable.latitude,
      restaurantLng: restaurantsTable.longitude,
    })
    .from(ordersTable)
    .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order) return null;

  const items = await db.select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  return { ...order, items };
};
