import express from "express";
import {
  createOrderHandler,
  getMyOrdersHandler,
  getOrderDetailHandler,
  cancelOrderHandler,
} from "../controller/order.controller.js";

const router = express.Router();

// All routes require authentication (applied in index.ts)
router.post("/", createOrderHandler);
router.get("/", getMyOrdersHandler);
router.get("/:id", getOrderDetailHandler);
router.patch("/:id/cancel", cancelOrderHandler);

export default router;
