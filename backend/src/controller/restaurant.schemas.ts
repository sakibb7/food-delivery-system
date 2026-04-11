import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  logo: z.string().max(255).optional(),
  coverImage: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional().or(z.literal("")),
  address: z.string().min(1),
  city: z.string().min(1).max(100),
  area: z.string().max(100).optional(),
  latitude: z.union([z.number(), z.string()]).transform(String).optional(),
  longitude: z.union([z.number(), z.string()]).transform(String).optional(),
  deliveryFee: z.union([z.number(), z.string()]).transform(String).optional(),
  minOrderAmount: z.union([z.number(), z.string()]).transform(String).optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export const restaurantIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid restaurant ID"),
});
