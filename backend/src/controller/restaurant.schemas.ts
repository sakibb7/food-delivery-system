import { z } from "zod";

const numericString = z.union([z.number(), z.string()]).transform((val) => {
  if (typeof val === "number") return val.toString();
  return val.replace(/[^0-9.]/g, "");
});

export const createRestaurantSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  logo: z.string().max(255).optional(),
  coverImage: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional().or(z.literal("")),
  address: z.string().min(1),
  city: z.string().min(1).max(100),
  country: z.string().max(100).optional(),
  zipcode: z.string().max(20).optional(),
  area: z.string().max(100).optional(),
  cuisine: z.string().max(255).optional(),
  deliveryTime: z.string().max(100).optional(),
  latitude: numericString.optional(),
  longitude: numericString.optional(),
  deliveryFee: numericString.optional(),
  minOrderAmount: numericString.optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export const restaurantIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid restaurant ID"),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "preparing",
    "ready_for_pickup",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ]),
});

export const orderIdSchema = z.object({
  orderId: z.string().regex(/^\d+$/, "Invalid order ID"),
});

