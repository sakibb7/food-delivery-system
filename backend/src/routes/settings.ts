import { Router } from "express";
import { getAllSettingsHandler, updateSettingsHandler } from "../controller/settings.controller.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

// Everyone can fetch settings? Usually yes, since app_url, fee rules are public.
// But we'll put authentication for now. In a real app, GET could be public for some settings.
router.get("/", authenticate, getAllSettingsHandler);

// Only admins should update
router.put("/", authenticate, updateSettingsHandler);

export default router;
