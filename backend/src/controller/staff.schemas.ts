import { z } from "zod";

export const createStaffSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(6),
  adminRoleId: z.number().int().positive(),
});

export const updateStaffSchema = z.object({
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  adminRoleId: z.number().int().positive().optional(),
  status: z.enum(["active", "inactive", "banned"]).optional(),
});
