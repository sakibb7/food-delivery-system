import { z } from "zod";

export const createRestaurantReviewSchema = z.object({
  orderId: z.number().int().positive(),
  restaurantId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const createRiderReviewSchema = z.object({
  orderId: z.number().int().positive(),
  riderId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const reviewTargetIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid ID"),
});
