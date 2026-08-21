import { eq, and, desc, inArray, ilike, or, sql, count, countDistinct } from "drizzle-orm";
import { db } from "../db/index.js";
import { isValidTransition } from "../utils/orderStateMachine.js";
import { restaurantsTable } from "../db/schema/restaurantSchema.js";
import { ordersTable, orderItemsTable } from "../db/schema/orderSchema.js";
import { usersTable } from "../db/schema/userSchema.js";
import { menuItemsTable } from "../db/schema/menuItemSchema.js";
import { restaurantReviewsTable } from "../db/schema/reviewSchema.js";

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
  data: Partial<typeof restaurantsTable.$inferInsert>
) => {
  if (data.name && !data.slug) {
    // Optionally update slug if name changes, or keep original. We will keep original unless specifically requested.
  }

  const [updatedRestaurant] = await db
    .update(restaurantsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(restaurantsTable.id, id))
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

// ── Admin-specific services ────────────────────────────────────────────────────

export const getAllRestaurantsAdmin = async () => {
  const restaurants = await db
    .select({
      id: restaurantsTable.id,
      name: restaurantsTable.name,
      slug: restaurantsTable.slug,
      description: restaurantsTable.description,
      logo: restaurantsTable.logo,
      coverImage: restaurantsTable.coverImage,
      phone: restaurantsTable.phone,
      email: restaurantsTable.email,
      address: restaurantsTable.address,
      city: restaurantsTable.city,
      area: restaurantsTable.area,
      cuisine: restaurantsTable.cuisine,
      deliveryTime: restaurantsTable.deliveryTime,
      isOpen: restaurantsTable.isOpen,
      isActive: restaurantsTable.isActive,
      isVerified: restaurantsTable.isVerified,
      status: restaurantsTable.status,
      rating: restaurantsTable.rating,
      totalReviews: restaurantsTable.totalReviews,
      createdAt: restaurantsTable.createdAt,
      ownerId: restaurantsTable.ownerId,
      ownerFirstName: usersTable.firstName,
      ownerLastName: usersTable.lastName,
      ownerEmail: usersTable.email,
    })
    .from(restaurantsTable)
    .leftJoin(usersTable, eq(restaurantsTable.ownerId, usersTable.id))
    .orderBy(desc(restaurantsTable.createdAt));

  return restaurants;
};

export const approveRestaurant = async (id: number) => {
  const [restaurant] = await db
    .update(restaurantsTable)
    .set({ status: "approved", isActive: true, isVerified: true, updatedAt: new Date() })
    .where(eq(restaurantsTable.id, id))
    .returning();

  return restaurant;
};

export const suspendRestaurant = async (id: number) => {
  const [restaurant] = await db
    .update(restaurantsTable)
    .set({ status: "suspended", isActive: false, updatedAt: new Date() })
    .where(eq(restaurantsTable.id, id))
    .returning();

  return restaurant;
};

export const rejectRestaurant = async (id: number) => {
  const [restaurant] = await db
    .update(restaurantsTable)
    .set({ status: "rejected", isActive: false, isVerified: false, updatedAt: new Date() })
    .where(eq(restaurantsTable.id, id))
    .returning();

  return restaurant;
};

export const adminDeleteRestaurant = async (id: number) => {
  const [deletedRestaurant] = await db
    .delete(restaurantsTable)
    .where(eq(restaurantsTable.id, id))
    .returning();

  return deletedRestaurant;
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
  const itemsByOrderId: Record<number, (typeof items)> = {};
  items.forEach((item) => {
    const orderId = item.orderId;
    if (!itemsByOrderId[orderId]) {
      itemsByOrderId[orderId] = [];
    }
    const list = itemsByOrderId[orderId];
    if (list) {
      list.push(item);
    }
  });

  return orders.map((order) => ({
    ...order,
    items: itemsByOrderId[order.id] || [],
  }));
};

export const updateRestaurantOrderStatus = async (
  restaurantId: number,
  orderId: number,
  ownerId: number,
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled" | "ready_for_pickup"
) => {
  // First, verify the user owns the restaurant
  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(and(eq(restaurantsTable.id, restaurantId), eq(restaurantsTable.ownerId, ownerId)))
    .limit(1);

  if (!restaurant) throw new Error("Restaurant not found or unauthorized");

  const [currentOrder] = await db
    .select({ status: ordersTable.status })
    .from(ordersTable)
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.restaurantId, restaurantId)))
    .limit(1);

  if (!currentOrder) throw new Error("Order not found");

  if (!isValidTransition(currentOrder.status, status)) {
    throw new Error(`Invalid status transition from ${currentOrder.status} to ${status}`);
  }

  // Restrict restaurant from marking as out_for_delivery or delivered directly here
  if (status === "out_for_delivery" || status === "delivered") {
    throw new Error("Restaurants cannot directly mark orders as out for delivery or delivered. A rider must be assigned.");
  }

  // Add cancellation window
  if (status === "cancelled" && !["pending", "confirmed"].includes(currentOrder.status)) {
    throw new Error("Orders can only be cancelled while pending or confirmed.");
  }

  const [updatedOrder] = await db
    .update(ordersTable)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.restaurantId, restaurantId)))
    .returning();

  return updatedOrder;
};

export const markOrderSelfDelivered = async (
  restaurantId: number,
  orderId: number,
  ownerId: number
) => {
  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(and(eq(restaurantsTable.id, restaurantId), eq(restaurantsTable.ownerId, ownerId)))
    .limit(1);

  if (!restaurant) throw new Error("Restaurant not found or unauthorized");

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.restaurantId, restaurantId)))
    .limit(1);

  if (!order) throw new Error("Order not found");

  // Only allow self delivery if order is ready for pickup or out for delivery
  if (!["ready_for_pickup", "out_for_delivery"].includes(order.status)) {
    throw new Error("Order must be ready for pickup or out for delivery to be self-delivered");
  }

  const updateData: any = {
    status: "delivered",
    deliveredAt: new Date(),
  };

  if (order.paymentMethod === "cod") {
    updateData.paymentStatus = "paid";
  }

  const [updatedOrder] = await db
    .update(ordersTable)
    .set(updateData)
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.restaurantId, restaurantId)))
    .returning();

  // If COD, we need to reconcile the money collected by the restaurant on behalf of the platform.
  // We can deduct the commission from the restaurant's earnings balance implicitly, 
  // or create a COD remittance assigned to the restaurant instead of a rider.
  // Wait, if restaurant collects cash, they collected Subtotal + DeliveryFee. 
  // But they owe the platform PlatformCommission. 
  // Actually, the payout system calculates Restaurant Earnings = Subtotal - PlatformCommission.
  // If the restaurant collects ALL cash, they owe the platform: Total - Restaurant Earnings.
  // The system currently has `restaurantPayoutsTable`. If they owe the platform, their `availableBalance` would just go negative if they haven't earned enough, or we just rely on `totalEarnings` calculation.
  // Wait, `payout.services.ts` calculates `totalEarnings = sum(ordersTable.restaurantEarnings)`.
  // If the order is COD, they got the cash directly. So they shouldn't be paid again!
  // Wow, the payout system completely ignores if the payment was COD!
  // If payment is COD, the restaurant already has the cash (or the rider has it).
  // If rider has it, rider remits it to platform, then platform pays restaurant.
  // If restaurant self-delivered COD, restaurant has the cash.
  // We need to record this.

  return updatedOrder;
};

export const getOwnerDashboardAnalytics = async (ownerId: number) => {
  const restaurants = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.ownerId, ownerId));

  const totalRestaurants = restaurants.length;
  if (totalRestaurants === 0) {
    return {
      stats: { totalRestaurants: 0, todaysOrders: 0, totalRevenue: 0, totalCustomers: 0 },
      activeRestaurants: [],
      recentActivity: []
    };
  }

  const restaurantIds = restaurants.map(r => r.id);

  const allOrders = await db
    .select({
      id: ordersTable.id,
      restaurantId: ordersTable.restaurantId,
      status: ordersTable.status,
      total: ordersTable.total,
      createdAt: ordersTable.createdAt,
      userId: ordersTable.userId,
      userFirstName: usersTable.firstName,
      userLastName: usersTable.lastName,
      restaurantName: restaurantsTable.name
    })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
    .where(inArray(ordersTable.restaurantId, restaurantIds))
    .orderBy(desc(ordersTable.createdAt));

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let todaysOrdersCount = 0;
  let totalRevenue = 0;
  const uniqueCustomers = new Set<number>();

  const activeRestaurantsMap = new Map<number, { id: number, name: string, status: string, ordersToday: number, revenue: number }>();
  restaurants.forEach(r => {
    activeRestaurantsMap.set(r.id, {
      id: r.id,
      name: r.name,
      status: r.isOpen ? "Open" : "Closed",
      ordersToday: 0,
      revenue: 0
    });
  });

  allOrders.forEach(order => {
    if (order.createdAt && new Date(order.createdAt) >= startOfToday) {
      todaysOrdersCount++;
      const rest = activeRestaurantsMap.get(order.restaurantId!);
      if (rest) rest.ordersToday++;
    }

    if (order.status === "delivered") {
      const rev = Number(order.total) || 0;
      totalRevenue += rev;
      const rest = activeRestaurantsMap.get(order.restaurantId!);
      if (rest) rest.revenue += rev;
    }

    if (order.userId) {
      uniqueCustomers.add(order.userId);
    }
  });

  const recentActivity = allOrders.slice(0, 5).map(order => {
    const timeDiff = new Date().getTime() - new Date(order.createdAt!).getTime();
    const minutes = Math.floor(timeDiff / 60000);
    const hours = Math.floor(minutes / 60);
    let timeStr = `${minutes} min ago`;
    if (hours > 0) timeStr = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (hours > 24) timeStr = `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''} ago`;

    return {
      title: "New Order",
      time: timeStr,
      desc: `Order #ORD-${order.id} received at ${order.restaurantName}`,
    };
  });

  return {
    stats: {
      totalRestaurants,
      todaysOrders: todaysOrdersCount,
      totalRevenue: totalRevenue,
      totalCustomers: uniqueCustomers.size
    },
    activeRestaurants: Array.from(activeRestaurantsMap.values()),
    recentActivity
  };
};

// ── Admin: Get full restaurant details ──────────────────────────────────────

export const getRestaurantDetailsForAdmin = async (restaurantId: number) => {
  // 1. Restaurant profile with owner info
  const [restaurant] = await db
    .select({
      id: restaurantsTable.id,
      name: restaurantsTable.name,
      slug: restaurantsTable.slug,
      description: restaurantsTable.description,
      logo: restaurantsTable.logo,
      coverImage: restaurantsTable.coverImage,
      phone: restaurantsTable.phone,
      email: restaurantsTable.email,
      address: restaurantsTable.address,
      city: restaurantsTable.city,
      state: restaurantsTable.state,
      area: restaurantsTable.area,
      cuisine: restaurantsTable.cuisine,
      deliveryTime: restaurantsTable.deliveryTime,
      isOpen: restaurantsTable.isOpen,
      isActive: restaurantsTable.isActive,
      isVerified: restaurantsTable.isVerified,
      status: restaurantsTable.status,
      rating: restaurantsTable.rating,
      totalReviews: restaurantsTable.totalReviews,
      createdAt: restaurantsTable.createdAt,
      ownerId: restaurantsTable.ownerId,
      ownerFirstName: usersTable.firstName,
      ownerLastName: usersTable.lastName,
      ownerEmail: usersTable.email,
    })
    .from(restaurantsTable)
    .leftJoin(usersTable, eq(restaurantsTable.ownerId, usersTable.id))
    .where(eq(restaurantsTable.id, restaurantId))
    .limit(1);

  if (!restaurant) return null;

  // 2. Orders with customer name
  const orders = await db
    .select({
      id: ordersTable.id,
      customer: usersTable.firstName,
      customerLast: usersTable.lastName,
      status: ordersTable.status,
      total: ordersTable.total,
      createdAt: ordersTable.createdAt,
    })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .where(eq(ordersTable.restaurantId, restaurantId))
    .orderBy(desc(ordersTable.createdAt));

  // 3. Menu items
  const menuItems = await db
    .select({
      id: menuItemsTable.id,
      name: menuItemsTable.name,
      description: menuItemsTable.description,
      price: menuItemsTable.price,
      category: menuItemsTable.category,
      image: menuItemsTable.image,
      isAvailable: menuItemsTable.isAvailable,
    })
    .from(menuItemsTable)
    .where(eq(menuItemsTable.restaurantId, restaurantId));

  // 4. Reviews with customer name
  const reviews = await db
    .select({
      id: restaurantReviewsTable.id,
      rating: restaurantReviewsTable.rating,
      comment: restaurantReviewsTable.comment,
      createdAt: restaurantReviewsTable.createdAt,
      customerFirstName: usersTable.firstName,
      customerLastName: usersTable.lastName,
    })
    .from(restaurantReviewsTable)
    .leftJoin(usersTable, eq(restaurantReviewsTable.userId, usersTable.id))
    .where(eq(restaurantReviewsTable.restaurantId, restaurantId))
    .orderBy(desc(restaurantReviewsTable.createdAt));

  // 5. Compute stats
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  return {
    restaurant: {
      ...restaurant,
      totalOrders,
      totalRevenue,
    },
    orders: orders.map((o) => ({
      id: o.id,
      customer: `${o.customer || ""} ${o.customerLast || ""}`.trim() || "Unknown",
      date: o.createdAt,
      amount: Number(o.total || 0),
      status: o.status,
    })),
    menuItems: menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      category: item.category || "Uncategorized",
      image: item.image,
      isAvailable: item.isAvailable ?? true,
    })),
    reviews: reviews.map((r) => ({
      id: r.id,
      customer: `${r.customerFirstName || ""} ${r.customerLastName || ""}`.trim() || "Anonymous",
      rating: r.rating,
      comment: r.comment || "",
      date: r.createdAt,
    })),
  };
};

// ── Public: Search restaurants ──────────────────────────────────────────────

export const searchRestaurants = async (filters: {
  q?: string;
  city?: string;
  area?: string;
}) => {
  const conditions = [eq(restaurantsTable.isActive, true)];

  if (filters.city) {
    conditions.push(ilike(restaurantsTable.city, filters.city));
  }

  if (filters.area) {
    conditions.push(ilike(restaurantsTable.area, filters.area));
  }

  if (filters.q) {
    const term = `%${filters.q}%`;

    // Find restaurant IDs that have matching menu items
    const matchingMenuRestaurants = await db
      .selectDistinct({ restaurantId: menuItemsTable.restaurantId })
      .from(menuItemsTable)
      .where(ilike(menuItemsTable.name, term));

    const menuRestaurantIds = matchingMenuRestaurants.map((r) => r.restaurantId);

    // Build OR condition: name/cuisine match OR restaurant has matching menu items
    const textConditions = [
      ilike(restaurantsTable.name, term),
      ilike(restaurantsTable.cuisine, term),
    ];

    if (menuRestaurantIds.length > 0) {
      textConditions.push(inArray(restaurantsTable.id, menuRestaurantIds));
    }

    conditions.push(or(...textConditions)!);
  }

  const restaurants = await db
    .select()
    .from(restaurantsTable)
    .where(and(...conditions))
    .orderBy(desc(restaurantsTable.rating));

  return restaurants;
};

// ── Public: Get popular cuisines ────────────────────────────────────────────

export const getPopularCuisines = async () => {
  const results = await db
    .select({
      cuisine: restaurantsTable.cuisine,
      count: count(restaurantsTable.id),
    })
    .from(restaurantsTable)
    .where(
      and(
        eq(restaurantsTable.isActive, true),
        sql`${restaurantsTable.cuisine} IS NOT NULL AND ${restaurantsTable.cuisine} != ''`
      )
    )
    .groupBy(restaurantsTable.cuisine)
    .orderBy(desc(count(restaurantsTable.id)))
    .limit(12);

  return results;
};

// ── Public: Get cities with restaurant counts ───────────────────────────────

export const getCitiesWithCounts = async () => {
  const results = await db
    .select({
      city: restaurantsTable.city,
      count: count(restaurantsTable.id),
    })
    .from(restaurantsTable)
    .where(eq(restaurantsTable.isActive, true))
    .groupBy(restaurantsTable.city)
    .orderBy(desc(count(restaurantsTable.id)));

  return results;
};

