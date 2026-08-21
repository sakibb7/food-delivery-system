import { z } from "zod";

export const createAddressSchema = z.object({
  label: z.string().min(1).max(50).default("Home"),
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(255),
  state: z.string().max(255).optional(),
  country: z.string().min(1, "Country is required").max(255),
  zipcode: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = z.object({
  label: z.string().min(1).max(50).optional(),
  address: z.string().min(1).max(500).optional(),
  city: z.string().min(1).max(255).optional(),
  state: z.string().max(255).optional().nullable(),
  country: z.string().min(1).max(255).optional(),
  zipcode: z.string().max(20).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  isDefault: z.boolean().optional(),
});
