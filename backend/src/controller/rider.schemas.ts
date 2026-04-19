import { z } from "zod";

export const createProfileSchema = z.object({
  vehicleType: z.enum(["bicycle", "scooter", "car"]),
  vehicleMakeModel: z.string().min(1, "Vehicle make and model is required"),
  vehicleRegistration: z.string().optional(),
  drivingLicenseUrl: z.string().optional(),
  vehicleRegistrationUrl: z.string().optional(),
});

export const updateLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const updateOnlineStatusSchema = z.object({
  isOnline: z.boolean(),
});
