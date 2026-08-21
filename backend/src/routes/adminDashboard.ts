import { Router } from "express";
import { getAdminDashboardStats } from "../controller/adminDashboard.controller.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";

const router = Router();

// Only admins can access the dashboard stats
router.get("/", authenticate, authorize(["admin"]), getAdminDashboardStats);

export default router;
