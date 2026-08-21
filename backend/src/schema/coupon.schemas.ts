import { z } from "zod";

const baseCouponSchema = z.object({
  code: z.string().min(1, "Code is required").max(50),
  type: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive("Discount value must be positive"),
  maxDiscount: z.number().positive().optional().nullable(),
  minPurchase: z.number().positive().optional().nullable(),
  expiryDate: z.string().datetime(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const createCouponSchema = baseCouponSchema.refine(data => {
  if (data.type === "percentage" && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountValue"],
});

export const updateCouponSchema = baseCouponSchema.partial().refine(data => {
  if (data.type === "percentage" && data.discountValue !== undefined && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountValue"],
});
