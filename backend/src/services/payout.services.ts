import { db } from "../db/index.js";
import { restaurantPayoutsTable } from "../db/schema/restaurantPayoutSchema.js";
import { ordersTable } from "../db/schema/orderSchema.js";
import { restaurantsTable } from "../db/schema/restaurantSchema.js";
import { usersTable } from "../db/schema/userSchema.js";
import { eq, and, desc, sum, inArray } from "drizzle-orm";

/**
 * Get earnings breakdown for a specific restaurant
 */
export const getRestaurantEarnings = async (restaurantId: number) => {
  // Total restaurant earnings from delivered orders
  const [earningsResult] = await db
    .select({
      totalEarnings: sum(ordersTable.restaurantEarnings),
      totalCommission: sum(ordersTable.platformCommission),
      totalOrders: sum(ordersTable.subtotal),
    })
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.restaurantId, restaurantId),
        eq(ordersTable.status, "delivered")
      )
    );

  // Total already paid out
  const [payoutResult] = await db
    .select({ totalPaidOut: sum(restaurantPayoutsTable.amount) })
    .from(restaurantPayoutsTable)
    .where(
      and(
        eq(restaurantPayoutsTable.restaurantId, restaurantId),
        inArray(restaurantPayoutsTable.status, ["paid", "processing", "pending"])
      )
    );

  const totalEarnings = Number(earningsResult?.totalEarnings || 0);
  const totalCommission = Number(earningsResult?.totalCommission || 0);
  const totalOrderValue = Number(earningsResult?.totalOrders || 0);
  const totalPaidOut = Number(payoutResult?.totalPaidOut || 0);
  const availableBalance = Math.max(0, totalEarnings - totalPaidOut);

  return {
    totalEarnings,
    totalCommission,
    totalOrderValue,
    totalPaidOut,
    availableBalance,
  };
};

/**
 * Get earnings for all restaurants owned by a user
 */
export const getOwnerEarnings = async (ownerId: number) => {
  // Get all restaurants owned by this user
  const restaurants = await db
    .select({ id: restaurantsTable.id, name: restaurantsTable.name })
    .from(restaurantsTable)
    .where(eq(restaurantsTable.ownerId, ownerId));

  if (restaurants.length === 0) {
    return {
      summary: { totalEarnings: 0, totalCommission: 0, totalPaidOut: 0, availableBalance: 0 },
      restaurants: [],
    };
  }

  const restaurantEarnings = [];
  let totalEarnings = 0;
  let totalCommission = 0;
  let totalPaidOut = 0;

  for (const restaurant of restaurants) {
    const earnings = await getRestaurantEarnings(restaurant.id);
    restaurantEarnings.push({
      id: restaurant.id,
      name: restaurant.name,
      ...earnings,
    });
    totalEarnings += earnings.totalEarnings;
    totalCommission += earnings.totalCommission;
    totalPaidOut += earnings.totalPaidOut;
  }

  return {
    summary: {
      totalEarnings,
      totalCommission,
      totalPaidOut,
      availableBalance: Math.max(0, totalEarnings - totalPaidOut),
    },
    restaurants: restaurantEarnings,
  };
};

/**
 * Get per-order earnings breakdown for a restaurant
 */
export const getRestaurantOrderEarnings = async (restaurantId: number) => {
  const orders = await db
    .select({
      id: ordersTable.id,
      subtotal: ordersTable.subtotal,
      deliveryFee: ordersTable.deliveryFee,
      tax: ordersTable.tax,
      discount: ordersTable.discount,
      total: ordersTable.total,
      platformCommission: ordersTable.platformCommission,
      restaurantEarnings: ordersTable.restaurantEarnings,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
      deliveredAt: ordersTable.deliveredAt,
      paymentMethod: ordersTable.paymentMethod,
      customerFirstName: usersTable.firstName,
      customerLastName: usersTable.lastName,
    })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .where(
      and(
        eq(ordersTable.restaurantId, restaurantId),
        eq(ordersTable.status, "delivered")
      )
    )
    .orderBy(desc(ordersTable.createdAt));

  return orders.map((o) => ({
    id: o.id,
    orderId: `ORD-${o.id}`,
    customer: `${o.customerFirstName || ""} ${o.customerLastName || ""}`.trim() || "Unknown",
    subtotal: Number(o.subtotal),
    commission: Number(o.platformCommission),
    netEarning: Number(o.restaurantEarnings),
    total: Number(o.total),
    paymentMethod: o.paymentMethod,
    date: o.deliveredAt || o.createdAt,
  }));
};

/**
 * Get payout history for all restaurants owned by a user
 */
export const getOwnerPayouts = async (ownerId: number) => {
  const restaurants = await db
    .select({ id: restaurantsTable.id })
    .from(restaurantsTable)
    .where(eq(restaurantsTable.ownerId, ownerId));

  if (restaurants.length === 0) return [];

  const restaurantIds = restaurants.map((r) => r.id);

  return await db
    .select({
      id: restaurantPayoutsTable.id,
      restaurantId: restaurantPayoutsTable.restaurantId,
      restaurantName: restaurantsTable.name,
      amount: restaurantPayoutsTable.amount,
      commissionAmount: restaurantPayoutsTable.commissionAmount,
      periodStart: restaurantPayoutsTable.periodStart,
      periodEnd: restaurantPayoutsTable.periodEnd,
      status: restaurantPayoutsTable.status,
      transactionRef: restaurantPayoutsTable.transactionRef,
      processedAt: restaurantPayoutsTable.processedAt,
      createdAt: restaurantPayoutsTable.createdAt,
    })
    .from(restaurantPayoutsTable)
    .leftJoin(restaurantsTable, eq(restaurantPayoutsTable.restaurantId, restaurantsTable.id))
    .where(inArray(restaurantPayoutsTable.restaurantId, restaurantIds))
    .orderBy(desc(restaurantPayoutsTable.createdAt));
};

// ── Owner Services ────────────────────────────────────────────────────────────

export const createPayoutRequest = async (
  restaurantId: number,
  ownerId: number,
  data: {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  }
) => {
  // Verify ownership
  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(and(eq(restaurantsTable.id, restaurantId), eq(restaurantsTable.ownerId, ownerId)))
    .limit(1);

  if (!restaurant) throw new Error("Restaurant not found or unauthorized");

  const earnings = await getRestaurantEarnings(restaurantId);
  if (data.amount > earnings.availableBalance) {
    throw new Error(`Amount (${data.amount}) exceeds available balance (${earnings.availableBalance}).`);
  }
  
  if (data.amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  // Find the earliest delivered order date for the period start
  const [firstOrder] = await db
    .select({ createdAt: ordersTable.createdAt })
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.restaurantId, restaurantId),
        eq(ordersTable.status, "delivered")
      )
    )
    .orderBy(ordersTable.createdAt)
    .limit(1);

  const periodStart = firstOrder?.createdAt || new Date();
  const periodEnd = new Date();

  const [payout] = await db
    .insert(restaurantPayoutsTable)
    .values({
      restaurantId,
      amount: data.amount.toFixed(2),
      commissionAmount: "0.00", // Will be reconciled later or not used here
      periodStart,
      periodEnd,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountHolderName: data.accountHolderName,
      status: "pending",
    })
    .returning();

  return payout;
};

// ── Admin services ────────────────────────────────────────────────────────────

/**
 * Admin creates a payout to a restaurant
 */
export const createPayout = async (data: {
  restaurantId: number;
  amount: number;
  commissionAmount: number;
  periodStart: Date;
  periodEnd: Date;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  adminNotes?: string;
}) => {
  const earnings = await getRestaurantEarnings(data.restaurantId);
  if (data.amount > earnings.availableBalance) {
    throw new Error(`Cannot create payout. Amount (${data.amount}) exceeds available balance (${earnings.availableBalance}).`);
  }

  const [payout] = await db
    .insert(restaurantPayoutsTable)
    .values({
      restaurantId: data.restaurantId,
      amount: data.amount.toFixed(2),
      commissionAmount: data.commissionAmount.toFixed(2),
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountHolderName: data.accountHolderName,
      adminNotes: data.adminNotes || null,
      status: "pending",
    })
    .returning();

  return payout;
};

/**
 * Admin processes/marks a payout as paid
 */
export const updatePayoutStatus = async (
  payoutId: number,
  status: "processing" | "paid" | "failed",
  transactionRef?: string,
  adminNotes?: string
) => {
  const updateData: any = { status };
  if (status === "paid") {
    updateData.processedAt = new Date();
  }
  if (transactionRef) {
    updateData.transactionRef = transactionRef;
  }
  if (adminNotes) {
    updateData.adminNotes = adminNotes;
  }

  const [updated] = await db
    .update(restaurantPayoutsTable)
    .set(updateData)
    .where(eq(restaurantPayoutsTable.id, payoutId))
    .returning();

  return updated;
};

/**
 * Admin: get all payouts
 */
export const getAllPayouts = async () => {
  return await db
    .select({
      id: restaurantPayoutsTable.id,
      restaurantId: restaurantPayoutsTable.restaurantId,
      restaurantName: restaurantsTable.name,
      amount: restaurantPayoutsTable.amount,
      commissionAmount: restaurantPayoutsTable.commissionAmount,
      periodStart: restaurantPayoutsTable.periodStart,
      periodEnd: restaurantPayoutsTable.periodEnd,
      status: restaurantPayoutsTable.status,
      bankName: restaurantPayoutsTable.bankName,
      accountNumber: restaurantPayoutsTable.accountNumber,
      accountHolderName: restaurantPayoutsTable.accountHolderName,
      transactionRef: restaurantPayoutsTable.transactionRef,
      adminNotes: restaurantPayoutsTable.adminNotes,
      processedAt: restaurantPayoutsTable.processedAt,
      createdAt: restaurantPayoutsTable.createdAt,
    })
    .from(restaurantPayoutsTable)
    .leftJoin(restaurantsTable, eq(restaurantPayoutsTable.restaurantId, restaurantsTable.id))
    .orderBy(desc(restaurantPayoutsTable.createdAt));
};

/**
 * Get all restaurants with their available balances (for admin payout creation)
 */
export const getRestaurantBalancesForAdmin = async () => {
  const restaurants = await db
    .select({
      id: restaurantsTable.id,
      name: restaurantsTable.name,
      ownerId: restaurantsTable.ownerId,
      ownerFirstName: usersTable.firstName,
      ownerLastName: usersTable.lastName,
    })
    .from(restaurantsTable)
    .leftJoin(usersTable, eq(restaurantsTable.ownerId, usersTable.id))
    .where(eq(restaurantsTable.isActive, true));

  const result = [];
  for (const restaurant of restaurants) {
    const earnings = await getRestaurantEarnings(restaurant.id);
    result.push({
      ...restaurant,
      ownerName: `${restaurant.ownerFirstName || ""} ${restaurant.ownerLastName || ""}`.trim(),
      ...earnings,
    });
  }

  return result;
};

/**
 * Get payout summary for admin dashboard
 */
export const getPayoutSummary = async () => {
  // Total pending payouts
  const [pendingResult] = await db
    .select({ total: sum(restaurantPayoutsTable.amount) })
    .from(restaurantPayoutsTable)
    .where(inArray(restaurantPayoutsTable.status, ["pending", "processing"]));

  // Total paid
  const [paidResult] = await db
    .select({ total: sum(restaurantPayoutsTable.amount) })
    .from(restaurantPayoutsTable)
    .where(eq(restaurantPayoutsTable.status, "paid"));

  // Total platform commission earned (from delivered orders)
  const [commissionResult] = await db
    .select({ total: sum(ordersTable.platformCommission) })
    .from(ordersTable)
    .where(eq(ordersTable.status, "delivered"));

  return {
    pendingPayouts: Number(pendingResult?.total || 0),
    totalPaidOut: Number(paidResult?.total || 0),
    platformRevenue: Number(commissionResult?.total || 0),
  };
};
