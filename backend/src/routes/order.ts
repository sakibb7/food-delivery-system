import express from "express";
import {
  createOrderHandler,
  getMyOrdersHandler,
  getOrderDetailHandler,
  cancelOrderHandler,
  getAllOrdersHandler,
} from "../controller/order.controller.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// All routes require authentication (applied in index.ts)
router.post("/", createOrderHandler);
router.get("/", getMyOrdersHandler);
router.get("/admin/all", authorize(["admin"]), getAllOrdersHandler);
router.get("/:id", getOrderDetailHandler);
router.patch("/:id/cancel", cancelOrderHandler);

export default router;
