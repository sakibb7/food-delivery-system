import { Request, Response } from "express";
import { db } from "../db/index.js";
import { ordersTable } from "../db/schema/orderSchema.js";
import { restaurantsTable } from "../db/schema/restaurantSchema.js";
import { usersTable } from "../db/schema/userSchema.js";
import { riderProfilesTable } from "../db/schema/riderProfileSchema.js";
import { eq, inArray, count, sum, desc } from "drizzle-orm";
import AppError from "../utils/AppError.js";

export const getAdminDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Total Revenue (Sum of 'total' for 'delivered' orders)
    const revenueResult = await db
      .select({ totalRevenue: sum(ordersTable.total) })
      .from(ordersTable)
      .where(eq(ordersTable.status, "delivered"));
    const totalRevenueStr = revenueResult[0]?.totalRevenue || "0";
    // Using parseInt or parseFloat might lose precision if we don't format it right, but we'll keep it simple
    const totalRevenue = parseFloat(totalRevenueStr);

    // Active Orders (Pending, Confirmed, Preparing, Ready for pickup, Out for delivery)
    const activeOrdersResult = await db
      .select({ count: count() })
      .from(ordersTable)
      .where(
        inArray(ordersTable.status, [
          "pending",
          "confirmed",
          "preparing",
          "ready_for_pickup",
          "out_for_delivery",
        ])
      );
    const activeOrders = activeOrdersResult[0]?.count || 0;

    // Total Restaurants
    const restaurantsResult = await db
      .select({ count: count() })
      .from(restaurantsTable);
    const totalRestaurants = restaurantsResult[0]?.count || 0;

    // Total Users
    const usersResult = await db.select({ count: count() }).from(usersTable);
    const totalUsers = usersResult[0]?.count || 0;

    // Recent Orders (Last 5)
    const recentOrders = await db
      .select({
        id: ordersTable.id,
        status: ordersTable.status,
        total: ordersTable.total,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        restaurantName: restaurantsTable.name,
      })
      .from(ordersTable)
      .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
      .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
      .orderBy(desc(ordersTable.createdAt))
      .limit(5);

    const formattedRecentOrders = recentOrders.map((order) => ({
      id: `ORD-${order.id.toString().padStart(3, "0")}`,
      customer: order.firstName && order.lastName ? `${order.firstName} ${order.lastName}` : "Unknown Customer",
      restaurant: order.restaurantName || "Unknown Restaurant",
      amount: order.total,
      status:
        order.status.charAt(0).toUpperCase() +
        order.status.slice(1).replace(/_/g, " "),
    }));

    // Needs Attention Stats
    const pendingRestaurantsResult = await db
      .select({ count: count() })
      .from(restaurantsTable)
      .where(eq(restaurantsTable.status, "pending"));
    const pendingRestaurants = pendingRestaurantsResult[0]?.count || 0;

    const pendingRidersResult = await db
      .select({ count: count() })
      .from(riderProfilesTable)
      .where(eq(riderProfilesTable.approvalStatus, "pending"));
    const pendingRiders = pendingRidersResult[0]?.count || 0;

    res.status(200).json({
      status: "success",
      data: {
        stats: {
          totalRevenue: totalRevenue.toLocaleString("en-IN"),
          activeOrders,
          totalRestaurants,
          totalUsers,
        },
        recentOrders: formattedRecentOrders,
        needsAttention: {
          pendingRestaurants,
          refundRequests: 0, // Hardcoded as per the plan
          pendingRiders,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch dashboard statistics",
    });
  }
};
