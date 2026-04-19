import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  ordersTable,
  orderItemsTable,
} from "../db/schema/orderSchema.js";
import { menuItemsTable } from "../db/schema/menuItemSchema.js";
import { restaurantsTable } from "../db/schema/restaurantSchema.js";
import { usersTable } from "../db/schema/userSchema.js";

const TAX_RATE = 0.05; // 5%

interface CreateOrderInput {
  restaurantId: number;
  items: { menuItemId: number; quantity: number }[];
  deliveryAddress: string;
  deliveryPhone: string;
  notes?: string | undefined;
}

export const createOrder = async (userId: number, data: CreateOrderInput) => {
  // 1. Fetch real menu item prices from DB to prevent price tampering
  const menuItemIds = data.items.map((i) => i.menuItemId);

  const menuItems = await db
    .select()
    .from(menuItemsTable)
    .where(
      and(
        inArray(menuItemsTable.id, menuItemIds),
        eq(menuItemsTable.restaurantId, data.restaurantId)
      )
    );

  // Verify all items exist and belong to the restaurant
  if (menuItems.length !== menuItemIds.length) {
    throw new Error("Some menu items were not found or don't belong to this restaurant");
  }

  // 2. Fetch restaurant for delivery fee & estimated time
  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, data.restaurantId))
    .limit(1);

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  // 3. Calculate pricing
  const menuItemMap = new Map(menuItems.map((mi) => [mi.id, mi]));

  let subtotal = 0;
  const orderItemsData = data.items.map((item) => {
    const menuItem = menuItemMap.get(item.menuItemId)!;
    const itemTotal = parseFloat(menuItem.price) * item.quantity;
    subtotal += itemTotal;

    return {
      menuItemId: item.menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
    };
  });

  const deliveryFee = parseFloat(restaurant.deliveryFee ?? "0");
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

  // 4. Insert order + items in a pseudo-transaction
  const [order] = await db
    .insert(ordersTable)
    .values({
      userId,
      restaurantId: data.restaurantId,
      status: "pending",
      paymentMethod: "cod",
      paymentStatus: "pending",
      deliveryAddress: data.deliveryAddress,
      deliveryPhone: data.deliveryPhone,
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      notes: data.notes || null,
      estimatedDeliveryTime: restaurant.deliveryTime || "30-45 min",
    })
    .returning();

  if (!order) {
    throw new Error("Failed to create order");
  }

  // Insert order items
  await db.insert(orderItemsTable).values(
    orderItemsData.map((item) => ({
      ...item,
      orderId: order.id,
    }))
  );

  return order;
};

export const getOrdersByUserId = async (userId: number) => {
  const orders = await db
    .select({
      id: ordersTable.id,
      status: ordersTable.status,
      paymentMethod: ordersTable.paymentMethod,
      paymentStatus: ordersTable.paymentStatus,
      total: ordersTable.total,
      subtotal: ordersTable.subtotal,
      deliveryFee: ordersTable.deliveryFee,
      tax: ordersTable.tax,
      createdAt: ordersTable.createdAt,
      estimatedDeliveryTime: ordersTable.estimatedDeliveryTime,
      restaurantId: ordersTable.restaurantId,
      restaurantName: restaurantsTable.name,
      restaurantLogo: restaurantsTable.logo,
      restaurantSlug: restaurantsTable.slug,
    })
    .from(ordersTable)
    .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
    .where(eq(ordersTable.userId, userId))
    .orderBy(desc(ordersTable.createdAt));

  return orders;
};

export const getOrderById = async (orderId: number, userId: number) => {
  const [order] = await db
    .select({
      id: ordersTable.id,
      userId: ordersTable.userId,
      restaurantId: ordersTable.restaurantId,
      riderId: ordersTable.riderId,
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
      restaurantName: restaurantsTable.name,
      restaurantLogo: restaurantsTable.logo,
      restaurantSlug: restaurantsTable.slug,
      restaurantPhone: restaurantsTable.phone,
    })
    .from(ordersTable)
    .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, userId)))
    .limit(1);

  if (!order) return null;

  // Fetch order items
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  return { ...order, items };
};

export const updateOrderStatus = async (
  orderId: number,
  userId: number,
  status: "cancelled"
) => {
  const [updatedOrder] = await db
    .update(ordersTable)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, userId)))
    .returning();

  return updatedOrder;
};

export const getAllOrders = async () => {
  const orders = await db
    .select({
      id: ordersTable.id,
      status: ordersTable.status,
      paymentMethod: ordersTable.paymentMethod,
      paymentStatus: ordersTable.paymentStatus,
      total: ordersTable.total,
      subtotal: ordersTable.subtotal,
      deliveryFee: ordersTable.deliveryFee,
      tax: ordersTable.tax,
      createdAt: ordersTable.createdAt,
      estimatedDeliveryTime: ordersTable.estimatedDeliveryTime,
      restaurantId: ordersTable.restaurantId,
      restaurantName: restaurantsTable.name,
      userId: ordersTable.userId,
      customerName: sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`,
      customerEmail: usersTable.email,
    })
    .from(ordersTable)
    .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .orderBy(desc(ordersTable.createdAt));

  return orders;
};
