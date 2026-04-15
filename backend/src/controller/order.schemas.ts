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
  notes: z.string().optional(),
});

export const orderIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid order ID"),
});
