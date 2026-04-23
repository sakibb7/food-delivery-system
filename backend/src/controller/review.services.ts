import { eq, and, desc, avg, count, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  restaurantReviewsTable,
  riderReviewsTable,
} from "../db/schema/reviewSchema.js";
import { ordersTable } from "../db/schema/orderSchema.js";
import { restaurantsTable } from "../db/schema/restaurantSchema.js";
import { riderProfilesTable } from "../db/schema/riderProfileSchema.js";
import { usersTable } from "../db/schema/userSchema.js";
import AppError from "../utils/AppError.js";
import { BAD_REQUEST } from "../constants/http.js";

// ────────────────────────────────────────────────────────────────────────────────
// Restaurant Reviews
// ────────────────────────────────────────────────────────────────────────────────

interface CreateRestaurantReviewInput {
  orderId: number;
  restaurantId: number;
  rating: number;
  comment?: string | undefined;
}

export const createRestaurantReview = async (
  userId: number,
  data: CreateRestaurantReviewInput,
) => {
  // 1. Verify order exists, belongs to this user, and is delivered
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.id, data.orderId),
        eq(ordersTable.userId, userId),
        eq(ordersTable.restaurantId, data.restaurantId),
      ),
    )
    .limit(1);

  if (!order) {
    throw new AppError(BAD_REQUEST, "Order not found or does not belong to you");
  }

  if (order.status !== "delivered") {
    throw new AppError(BAD_REQUEST, "You can only review an order after it has been delivered");
  }

  // 2. Check if the user already reviewed this order's restaurant
  const [existing] = await db
    .select()
    .from(restaurantReviewsTable)
    .where(eq(restaurantReviewsTable.orderId, data.orderId))
    .limit(1);

  if (existing) {
    throw new AppError(BAD_REQUEST, "You have already reviewed this order");
  }

  // 3. Insert review
  const [review] = await db
    .insert(restaurantReviewsTable)
    .values({
      orderId: data.orderId,
      userId,
      restaurantId: data.restaurantId,
      rating: data.rating,
      comment: data.comment || null,
    })
    .returning();

  // 4. Recalculate average rating for the restaurant
  const [stats] = await db
    .select({
      avgRating: avg(restaurantReviewsTable.rating),
      totalReviews: count(restaurantReviewsTable.id),
    })
    .from(restaurantReviewsTable)
    .where(eq(restaurantReviewsTable.restaurantId, data.restaurantId));

  await db
    .update(restaurantsTable)
    .set({
      rating: parseFloat(stats?.avgRating || "0").toFixed(2),
      totalReviews: Number(stats?.totalReviews || 0),
    })
    .where(eq(restaurantsTable.id, data.restaurantId));

  return review;
};

export const getRestaurantReviews = async (restaurantId: number) => {
  const reviews = await db
    .select({
      id: restaurantReviewsTable.id,
      orderId: restaurantReviewsTable.orderId,
      rating: restaurantReviewsTable.rating,
      comment: restaurantReviewsTable.comment,
      createdAt: restaurantReviewsTable.createdAt,
      userName: sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`,
      userAvatar: usersTable.avatar,
    })
    .from(restaurantReviewsTable)
    .leftJoin(usersTable, eq(restaurantReviewsTable.userId, usersTable.id))
    .where(eq(restaurantReviewsTable.restaurantId, restaurantId))
    .orderBy(desc(restaurantReviewsTable.createdAt));

  return reviews;
};

// ────────────────────────────────────────────────────────────────────────────────
// Rider Reviews
// ────────────────────────────────────────────────────────────────────────────────

interface CreateRiderReviewInput {
  orderId: number;
  riderId: number;
  rating: number;
  comment?: string | undefined;
}

export const createRiderReview = async (
  userId: number,
  data: CreateRiderReviewInput,
) => {
  // 1. Verify order exists, belongs to this user, and is delivered
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.id, data.orderId),
        eq(ordersTable.userId, userId),
        eq(ordersTable.riderId, data.riderId),
      ),
    )
    .limit(1);

  if (!order) {
    throw new AppError(BAD_REQUEST, "Order not found or does not belong to you");
  }

  if (order.status !== "delivered") {
    throw new AppError(BAD_REQUEST, "You can only review an order after it has been delivered");
  }

  // 2. Check if the user already reviewed this order's rider
  const [existing] = await db
    .select()
    .from(riderReviewsTable)
    .where(eq(riderReviewsTable.orderId, data.orderId))
    .limit(1);

  if (existing) {
    throw new AppError(BAD_REQUEST, "You have already reviewed the rider for this order");
  }

  // 3. Insert review
  const [review] = await db
    .insert(riderReviewsTable)
    .values({
      orderId: data.orderId,
      userId,
      riderId: data.riderId,
      rating: data.rating,
      comment: data.comment || null,
    })
    .returning();

  // 4. Recalculate average rating for the rider
  const [stats] = await db
    .select({
      avgRating: avg(riderReviewsTable.rating),
      totalReviews: count(riderReviewsTable.id),
    })
    .from(riderReviewsTable)
    .where(eq(riderReviewsTable.riderId, data.riderId));

  await db
    .update(riderProfilesTable)
    .set({
      rating: parseFloat(stats?.avgRating || "0").toFixed(2),
      totalReviews: Number(stats?.totalReviews || 0),
    })
    .where(eq(riderProfilesTable.userId, data.riderId));

  return review;
};

export const getRiderReviews = async (riderId: number) => {
  const reviews = await db
    .select({
      id: riderReviewsTable.id,
      orderId: riderReviewsTable.orderId,
      rating: riderReviewsTable.rating,
      comment: riderReviewsTable.comment,
      createdAt: riderReviewsTable.createdAt,
      userName: sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`,
      userAvatar: usersTable.avatar,
    })
    .from(riderReviewsTable)
    .leftJoin(usersTable, eq(riderReviewsTable.userId, usersTable.id))
    .where(eq(riderReviewsTable.riderId, riderId))
    .orderBy(desc(riderReviewsTable.createdAt));

  return reviews;
};

// ────────────────────────────────────────────────────────────────────────────────
// Check review status for an order (used by frontend to know if already reviewed)
// ────────────────────────────────────────────────────────────────────────────────

export const getOrderReviewStatus = async (orderId: number, userId: number) => {
  const [restaurantReview] = await db
    .select({ id: restaurantReviewsTable.id })
    .from(restaurantReviewsTable)
    .where(
      and(
        eq(restaurantReviewsTable.orderId, orderId),
        eq(restaurantReviewsTable.userId, userId),
      ),
    )
    .limit(1);

  const [riderReview] = await db
    .select({ id: riderReviewsTable.id })
    .from(riderReviewsTable)
    .where(
      and(
        eq(riderReviewsTable.orderId, orderId),
        eq(riderReviewsTable.userId, userId),
      ),
    )
    .limit(1);

  return {
    hasRestaurantReview: !!restaurantReview,
    hasRiderReview: !!riderReview,
  };
};
