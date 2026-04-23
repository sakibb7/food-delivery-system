import { z } from "zod";

export const updateSettingsSchema = z.object({
  // General Settings
  company_name: z.string().min(1),
  support_email: z.string().email(),
  website_url: z.string().url(),
  support_phone: z.string().min(1),
  timezone: z.string().min(1),
  app_url: z.string().url(),
  company_address: z.string().min(1),
  
  // System Configuration
  force_secure_password: z.boolean(),
  kyc_verification: z.boolean(),
  phone_verification: z.boolean(),
  email_verification: z.boolean(),
  maintenance_mode: z.boolean(),

  // Commission & Fees
  platform_commission_rate: z.number().min(0).max(100),
  delivery_base_fee: z.number().min(0),
  delivery_fee_per_km: z.number().min(0),
  tax_rate: z.number().min(0).max(100),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
