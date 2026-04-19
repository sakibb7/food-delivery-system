import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  getProfile,
  updateProfile,
  updateLocation,
  updateOnlineStatus,
  getAvailableOrders,
  acceptOrder,
  pickupOrder,
  deliverOrder,
  getHistory,
  getEarnings,
  getOrderDetail
} from "../controller/rider.controller.js";

const router = Router();

// Ensure rider is authenticated
router.use(authenticate);

// Profile
router.get("/profile", getProfile);
router.post("/profile", updateProfile);
router.patch("/profile", updateProfile);

// Status & Location
router.patch("/online", updateOnlineStatus);
router.patch("/location", updateLocation);

// Orders
router.get("/orders/available", getAvailableOrders);
router.get("/orders/:id", getOrderDetail);
router.patch("/orders/:id/accept", acceptOrder);
router.patch("/orders/:id/pickup", pickupOrder);
router.patch("/orders/:id/deliver", deliverOrder);

// History & Earnings
router.get("/history", getHistory);
router.get("/earnings", getEarnings);

export default router;
