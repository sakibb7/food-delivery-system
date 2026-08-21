import { z } from "zod";

export const createPayoutSchema = z.object({
  restaurantId: z.number().int().positive(),
  amount: z.number().positive(),
  commissionAmount: z.number().nonnegative().optional().default(0),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
  bankName: z.string().min(2),
  accountNumber: z.string().min(5),
  accountHolderName: z.string().min(2),
  adminNotes: z.string().optional(),
});

export const updatePayoutStatusSchema = z.object({
  status: z.enum(["processing", "paid", "failed"]),
  transactionRef: z.string().optional(),
  adminNotes: z.string().optional(),
});
