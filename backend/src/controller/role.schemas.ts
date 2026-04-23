import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  permissions: z.array(z.string()),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(500).optional(),
  permissions: z.array(z.string()).optional(),
});
