import express from "express";
import {
  createOrderHandler,
  previewOrderPricingHandler,
  getMyOrdersHandler,
  getOrderDetailHandler,
  getAdminOrderDetailHandler,
  cancelOrderHandler,
  getAllOrdersHandler,
} from "../controller/order.controller.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// All routes require authentication (applied in index.ts)
router.post("/preview", previewOrderPricingHandler);
router.post("/", createOrderHandler);
router.get("/", getMyOrdersHandler);
router.get("/admin/all", authorize(["admin"]), getAllOrdersHandler);
router.get("/admin/:id", authorize(["admin"]), getAdminOrderDetailHandler);
router.get("/:id", getOrderDetailHandler);
router.patch("/:id/cancel", cancelOrderHandler);

export default router;
