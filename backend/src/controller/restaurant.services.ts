import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { restaurantsTable } from "../db/schema/restaurantSchema.js";
import { ordersTable, orderItemsTable } from "../db/schema/orderSchema.js";
import { usersTable } from "../db/schema/userSchema.js";

const generateSlug = (name: string) => {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") +
    "-" +
    Math.random().toString(36).substring(2, 6)
  );
};

export const createRestaurant = async (
  ownerId: number,
  data: Omit<
    typeof restaurantsTable.$inferInsert,
    "id" | "ownerId" | "slug" | "createdAt" | "updatedAt"
  >
) => {
  const slug = generateSlug(data.name);

  const [restaurant] = await db
    .insert(restaurantsTable)
    .values({
      ...data,
      slug,
      ownerId,
    })
    .returning();

  return restaurant;
};

export const updateRestaurant = async (
  id: number,
  ownerId: number,
  data: Partial<typeof restaurantsTable.$inferInsert>
) => {
  if (data.name && !data.slug) {
    // Optionally update slug if name changes, or keep original. We will keep original unless specifically requested.
  }

  const [updatedRestaurant] = await db
    .update(restaurantsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(restaurantsTable.id, id), eq(restaurantsTable.ownerId, ownerId)))
    .returning();

  return updatedRestaurant;
};

export const deleteRestaurant = async (id: number, ownerId: number) => {
  const [deletedRestaurant] = await db
    .delete(restaurantsTable)
    .where(and(eq(restaurantsTable.id, id), eq(restaurantsTable.ownerId, ownerId)))
    .returning();

  return deletedRestaurant;
};

export const getRestaurantById = async (id: number) => {
  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, id))
    .limit(1);

  return restaurant;
};

export const getAllRestaurants = async () => {
  // We can add filtering/pagination here later
  const restaurants = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.isActive, true));

  return restaurants;
};

export const getMyRestaurants = async (ownerId: number) => {
  const restaurants = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.ownerId, ownerId));

  return restaurants;
};

// Orders Management for Restaurant Owners

export const getRestaurantOrders = async (restaurantId: number, ownerId: number) => {
  // First, verify the user owns the restaurant
  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(and(eq(restaurantsTable.id, restaurantId), eq(restaurantsTable.ownerId, ownerId)))
    .limit(1);

  if (!restaurant) return null;

  // Fetch orders with user info
  const orders = await db
    .select({
      id: ordersTable.id,
      status: ordersTable.status,
      paymentMethod: ordersTable.paymentMethod,
      paymentStatus: ordersTable.paymentStatus,
      deliveryAddress: ordersTable.deliveryAddress,
      deliveryPhone: ordersTable.deliveryPhone,
      subtotal: ordersTable.subtotal,
      deliveryFee: ordersTable.deliveryFee,
      tax: ordersTable.tax,
      total: ordersTable.total,
      notes: ordersTable.notes,
      estimatedDeliveryTime: ordersTable.estimatedDeliveryTime,
      createdAt: ordersTable.createdAt,
      updatedAt: ordersTable.updatedAt,
      userFirstName: usersTable.firstName,
      userLastName: usersTable.lastName,
    })
    .from(ordersTable)
    // Here we need to import usersTable and ordersTable at the top
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .where(eq(ordersTable.restaurantId, restaurantId))
    .orderBy(desc(ordersTable.createdAt));

  // Fetch items for these orders
  const orderIds = orders.map(o => o.id);
  
  if (orderIds.length === 0) return [];

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(inArray(orderItemsTable.orderId, orderIds));

  // Group items by orderId
  const itemsByOrderId = items.reduce((acc, item) => {
    if (!acc[item.orderId]) acc[item.orderId] = [];
    acc[item.orderId].push(item);
    return acc;
  }, {} as Record<number, typeof items>);

  return orders.map(order => ({
    ...order,
    items: itemsByOrderId[order.id] || []
  }));
};

export const updateRestaurantOrderStatus = async (
  restaurantId: number,
  orderId: number,
  ownerId: number,
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"
) => {
  // First, verify the user owns the restaurant
  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(and(eq(restaurantsTable.id, restaurantId), eq(restaurantsTable.ownerId, ownerId)))
    .limit(1);

  if (!restaurant) throw new Error("Restaurant not found or unauthorized");

  const [updatedOrder] = await db
    .update(ordersTable)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.restaurantId, restaurantId)))
    .returning();

  if (!updatedOrder) throw new Error("Order not found");

  return updatedOrder;
};

