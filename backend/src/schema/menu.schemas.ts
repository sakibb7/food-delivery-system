import { z } from "zod";

const numericString = z.union([z.number(), z.string()]).transform((val) => {
  if (typeof val === "number") return val.toString();
  return val.replace(/[^0-9.]/g, "");
});

export const createMenuItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  price: numericString,
  category: z.string().max(100).optional(),
  image: z.string().max(255).optional(),
  isAvailable: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export const menuItemIdSchema = z.object({
  itemId: z.string().regex(/^\d+$/, "Invalid menu item ID"),
});

export const restaurantIdParamSchema = z.object({
  restaurantId: z.string().regex(/^\d+$/, "Invalid restaurant ID"),
});
