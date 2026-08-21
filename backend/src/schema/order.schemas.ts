import { z } from "zod";

export const createOrderSchema = z.object({
  restaurantId: z.number().int().positive(),
  items: z
    .array(
      z.object({
        menuItemId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, "At least one item is required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  deliveryPhone: z.string().min(5, "Phone number is required"),
  deliveryLat: z.number().optional(),
  deliveryLng: z.number().optional(),
  addressId: z.number().int().positive().optional(),
  couponCode: z.string().max(50).optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["cod", "card", "mobile_banking"]).optional().default("cod"),
});

export const orderIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid order ID"),
});
