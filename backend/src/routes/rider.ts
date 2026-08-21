import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
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
  getOrderDetail,
  adminGetAllRidersHandler,
  adminGetRiderDetailsHandler,
  adminUpdateRiderApprovalStatusHandler,
  getAvailableBalanceHandler,
  createWithdrawalHandler,
  getWithdrawalHistoryHandler
} from "../controller/rider.controller.js";
import {
  getRiderCodBalanceHandler,
  getRiderCodRemittancesHandler,
  adminGetAllCodRemittancesHandler,
  adminConfirmCodRemittanceHandler,
} from "../controller/codRemittance.controller.js";

const router = Router();

// Admin-only routes (must be before the general authenticate middleware)
router.get("/admin/all", authenticate, authorize(["admin"]), adminGetAllRidersHandler);
router.get("/admin/cod-remittances", authenticate, authorize(["admin"]), adminGetAllCodRemittancesHandler);
router.patch("/admin/cod-remittances/:id/confirm", authenticate, authorize(["admin"]), adminConfirmCodRemittanceHandler);
router.get("/admin/:id", authenticate, authorize(["admin"]), adminGetRiderDetailsHandler);
router.patch("/admin/:id/approval", authenticate, authorize(["admin"]), adminUpdateRiderApprovalStatusHandler);

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

// Withdrawals
router.get("/withdrawals/balance", getAvailableBalanceHandler);
router.get("/withdrawals", getWithdrawalHistoryHandler);
router.post("/withdrawals", createWithdrawalHandler);

// COD Remittances
router.get("/cod/balance", getRiderCodBalanceHandler);
router.get("/cod/remittances", getRiderCodRemittancesHandler);

export default router;
