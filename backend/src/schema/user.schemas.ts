import { z } from "zod";
import { passwordSchema } from "./auth.schemas.js";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
  avatar: z.url().optional(),
  phone: z.string().min(10).max(20).optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(255).optional(),
  country: z.string().max(255).optional(),
  zipcode: z.string().max(20).optional(),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });
