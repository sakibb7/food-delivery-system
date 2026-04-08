import { z } from "zod";

export const userStatusEnum = z.enum(["active", "inactive", "banned"]);
export const roles = z.enum(["admin", "restaurant", "rider", "user"]);

export const emailSchema = z.email().min(1).max(255);
export const passwordSchema = z.string().min(6).max(255).optional();

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: z.string().optional(),
});

export const registerSchema = loginSchema
  .extend({
    firstName: z.string().min(1).max(255),
    lastName: z.string().min(1).max(255),
    username: z.string().min(3).max(255),
    avatar: z.url().optional(),
    confirmPassword: z.string().min(8).max(255).optional(),
    phone: z.string().min(10).max(20).optional(),
    status: userStatusEnum,
    role: roles,

    address: z.string().max(255).optional(),
    city: z.string().max(255).optional(),
    country: z.string().max(255).optional(),
    zipcode: z.string().max(20).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"],
  });
