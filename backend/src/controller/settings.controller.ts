import { Request, Response } from "express";
import { getSettings, updateSettings } from "./settings.services.js";
import { updateSettingsSchema } from "./settings.schemas.js";

export const getAllSettingsHandler = async (req: Request, res: Response) => {
  try {
    const settings = await getSettings();
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

export const updateSettingsHandler = async (req: Request, res: Response) => {
  try {
    const data = updateSettingsSchema.parse(req.body);
    const updatedSettings = await updateSettings(data);
    res.status(200).json(updatedSettings);
  } catch (error: any) {
    console.error("Error updating settings:", error);
    if (error.name === "ZodError") {
      res.status(400).json({ error: "Invalid data format", details: error.errors });
    } else {
      res.status(500).json({ error: "Failed to update settings" });
    }
  }
};
