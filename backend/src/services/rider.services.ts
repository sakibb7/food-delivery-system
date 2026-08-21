import { db } from "../db/index.js";
import { riderProfilesTable } from "../db/schema/riderProfileSchema.js";
import { ordersTable, orderItemsTable } from "../db/schema/orderSchema.js";
import { usersTable } from "../db/schema/userSchema.js";
import { restaurantsTable } from "../db/schema/restaurantSchema.js";
import { withdrawalRequestsTable } from "../db/schema/withdrawalSchema.js";
import { createCodRemittance } from "./codRemittance.services.js";
import { eq, and, isNull, desc, count, sum, inArray } from "drizzle-orm";

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
      restaurantAddress: restaurantsTable.address,
      restaurantPhone: restaurantsTable.phone,
    })
    .from(ordersTable)
    .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
    .where(and(
      eq(ordersTable.status, "ready_for_pickup"),
      isNull(ordersTable.riderId)
    ));
};

export const acceptOrder = async (userId: number, orderId: number) => {
  // First, read the order to get its delivery fee for rider earnings
  const [existingOrder] = await db.select({
    deliveryFee: ordersTable.deliveryFee,
  })
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  const earnings = existingOrder?.deliveryFee ?? "5.00";

  // Race-condition safe: only update if order is still available (status + no rider)
  const result = await db.update(ordersTable)
    .set({ 
      riderId: userId, 
      status: "out_for_delivery",
      riderEarnings: earnings,
    })
    .where(and(
      eq(ordersTable.id, orderId),
      eq(ordersTable.status, "ready_for_pickup"),
      isNull(ordersTable.riderId)
    ))
    .returning();

  if (result.length === 0) {
    throw new Error("Order is no longer available");
  }

  // Return the full order detail with restaurant and delivery coordinates
  return await getOrderDetail(orderId, userId);
};

export const pickupOrder = async (userId: number, orderId: number) => {
  return await db.update(ordersTable)
    .set({ pickedUpAt: new Date(), status: "out_for_delivery" })
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.riderId, userId)))
    .returning();
};

export const deliverOrder = async (userId: number, orderId: number) => {
  // First get the order to check payment method and amounts
  const [order] = await db.select({
    paymentMethod: ordersTable.paymentMethod,
    total: ordersTable.total,
    riderEarnings: ordersTable.riderEarnings,
  })
    .from(ordersTable)
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.riderId, userId)))
    .limit(1);

  if (!order) {
    throw new Error("Order not found or not assigned to this rider");
  }

  // For COD orders, mark payment as paid upon delivery
  const updateData: any = { 
    status: "delivered", 
    deliveredAt: new Date() 
  };

  if (order.paymentMethod === "cod") {
    updateData.paymentStatus = "paid";
  }

  const result = await db.update(ordersTable)
    .set(updateData)
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.riderId, userId)))
    .returning();

  // Auto-create COD remittance record for COD orders
  if (order.paymentMethod === "cod") {
    try {
      await createCodRemittance(
        userId,
        orderId,
        Number(order.total),
        Number(order.riderEarnings)
      );
    } catch (err) {
      // Don't fail the delivery if remittance creation fails (e.g. duplicate)
      console.error("Failed to create COD remittance:", err);
    }
  }

  return result;
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

export const getOrderDetail = async (orderId: number, requestingRiderId?: number) => {
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
      restaurantAddress: restaurantsTable.address,
      restaurantPhone: restaurantsTable.phone,
    })
    .from(ordersTable)
    .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order) return null;

  // Validate rider ownership: if a rider is requesting, they must be assigned
  // Allow access if order has no rider yet (available orders) or if rider matches
  if (requestingRiderId && order.riderId && order.riderId !== requestingRiderId) {
    throw new Error("You are not authorized to view this order");
  }

  const items = await db.select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  return { ...order, items };
};

// ── Admin service ───────────────────────────────────────────────────────────

export const getAllRidersForAdmin = async () => {
  // Get all riders (users with role 'rider') joined with their profile
  const riders = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      avatar: usersTable.avatar,
      email: usersTable.email,
      phone: usersTable.phone,
      status: usersTable.status,
      createdAt: usersTable.createdAt,
      vehicleType: riderProfilesTable.vehicleType,
      isOnline: riderProfilesTable.isOnline,
      approvalStatus: riderProfilesTable.approvalStatus,
      rating: riderProfilesTable.rating,
      totalReviews: riderProfilesTable.totalReviews,
    })
    .from(usersTable)
    .leftJoin(riderProfilesTable, eq(usersTable.id, riderProfilesTable.userId))
    .where(eq(usersTable.role, "rider"))
    .orderBy(desc(usersTable.createdAt));

  // For each rider, count their delivered orders
  const riderIds = riders.map(r => r.id);
  const deliveryCounts: Record<number, number> = {};

  if (riderIds.length > 0) {
    for (const rider of riders) {
      const [result] = await db
        .select({ count: count() })
        .from(ordersTable)
        .where(and(
          eq(ordersTable.riderId, rider.id),
          eq(ordersTable.status, "delivered")
        ));
      deliveryCounts[rider.id] = result?.count || 0;
    }
  }

  return riders.map(r => ({
    ...r,
    totalDeliveries: deliveryCounts[r.id] || 0,
  }));
};

export const getRiderDetailsForAdmin = async (riderId: number) => {
  // Get user info + rider profile
  const [user] = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      avatar: usersTable.avatar,
      email: usersTable.email,
      phone: usersTable.phone,
      status: usersTable.status,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, riderId))
    .limit(1);

  if (!user) return null;

  // Get rider profile
  const [profile] = await db
    .select()
    .from(riderProfilesTable)
    .where(eq(riderProfilesTable.userId, riderId))
    .limit(1);

  // Get all orders assigned to this rider with restaurant info
  const deliveries = await db
    .select({
      id: ordersTable.id,
      status: ordersTable.status,
      total: ordersTable.total,
      deliveryFee: ordersTable.deliveryFee,
      riderEarnings: ordersTable.riderEarnings,
      deliveryAddress: ordersTable.deliveryAddress,
      createdAt: ordersTable.createdAt,
      deliveredAt: ordersTable.deliveredAt,
      restaurantName: restaurantsTable.name,
      customerFirstName: usersTable.firstName,
      customerLastName: usersTable.lastName,
    })
    .from(ordersTable)
    .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .where(eq(ordersTable.riderId, riderId))
    .orderBy(desc(ordersTable.createdAt));

  // Compute stats
  const totalDeliveries = deliveries.filter(d => d.status === "delivered").length;
  const totalEarnings = deliveries
    .filter(d => d.status === "delivered")
    .reduce(
      (sum, d) => sum + Number(d.riderEarnings || 0),
      0
    );

  // Build formatted deliveries
  const formattedDeliveries = deliveries.map((d) => ({
    id: d.id,
    orderId: `ORD-${d.id}`,
    restaurant: d.restaurantName || "Unknown",
    customer: d.customerFirstName && d.customerLastName
      ? `${d.customerFirstName} ${d.customerLastName}`
      : "Unknown",
    date: d.createdAt,
    earning: Number(d.riderEarnings || 0),
    status: d.status,
  }));

  // Build wallet transactions from deliveries (earnings as credits)
  const transactions = deliveries
    .filter(d => d.status === "delivered")
    .map((d) => ({
      id: `TXN-${d.id}`,
      type: "credit" as const,
      amount: Number(d.riderEarnings || 0),
      date: d.deliveredAt || d.createdAt,
      description: `Delivery Earning (ORD-${d.id})`,
    }));

  return {
    rider: {
      ...user,
      ...(
        profile
          ? {
              vehicleType: profile.vehicleType,
              vehicleMakeModel: profile.vehicleMakeModel,
              vehicleRegistration: profile.vehicleRegistration,
              drivingLicenseUrl: profile.drivingLicenseUrl,
              vehicleRegistrationUrl: profile.vehicleRegistrationUrl,
              isOnline: profile.isOnline,
              approvalStatus: profile.approvalStatus,
              rating: profile.rating,
              totalReviews: profile.totalReviews,
              profileCreatedAt: profile.createdAt,
            }
          : {}
      ),
      totalDeliveries,
      totalEarnings,
    },
    deliveries: formattedDeliveries,
    transactions,
  };
};

// ── Withdrawal services ─────────────────────────────────────────────────────

export const getAvailableBalance = async (userId: number): Promise<number> => {
  // Total earnings from delivered orders
  const history = await getRiderHistory(userId);
  const totalEarnings = history.reduce(
    (acc, order) => acc + Number(order.riderEarnings || 0),
    0
  );

  // Total already withdrawn (approved + paid)
  const withdrawals = await db
    .select({ total: sum(withdrawalRequestsTable.amount) })
    .from(withdrawalRequestsTable)
    .where(
      and(
        eq(withdrawalRequestsTable.riderId, userId),
        inArray(withdrawalRequestsTable.status, ["approved", "paid", "pending"])
      )
    );

  const totalWithdrawn = Number(withdrawals[0]?.total || 0);
  return Math.max(0, totalEarnings - totalWithdrawn);
};

export const createWithdrawal = async (
  userId: number,
  data: {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    branchName?: string;
    riderNotes?: string;
  }
) => {
  // Validate balance
  const available = await getAvailableBalance(userId);
  if (data.amount > available) {
    throw new Error("Insufficient balance");
  }
  if (data.amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  const [withdrawal] = await db
    .insert(withdrawalRequestsTable)
    .values({
      riderId: userId,
      amount: data.amount.toFixed(2),
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountHolderName: data.accountHolderName,
      branchName: data.branchName || null,
      riderNotes: data.riderNotes || null,
    })
    .returning();

  return withdrawal;
};

export const getRiderWithdrawals = async (userId: number) => {
  return await db
    .select()
    .from(withdrawalRequestsTable)
    .where(eq(withdrawalRequestsTable.riderId, userId))
    .orderBy(desc(withdrawalRequestsTable.createdAt));
};

export const updateRiderApprovalStatusForAdmin = async (riderId: number, status: string) => {
  const [updated] = await db
    .update(riderProfilesTable)
    .set({ approvalStatus: status as any })
    .where(eq(riderProfilesTable.userId, riderId))
    .returning();
  
  if (!updated) {
    throw new Error("Rider profile not found");
  }

  return updated;
};
