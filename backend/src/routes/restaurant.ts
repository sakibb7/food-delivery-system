import express from "express";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import {
  createRestaurantHandler,
  updateRestaurantHandler,
  deleteRestaurantHandler,
  getRestaurantHandler,
  getAllRestaurantsHandler,
  getMyRestaurantsHandler,
  getRestaurantOrdersHandler,
  updateRestaurantOrderStatusHandler,
  adminGetAllRestaurantsHandler,
  adminApproveRestaurantHandler,
  adminSuspendRestaurantHandler,
  adminRejectRestaurantHandler,
  adminDeleteRestaurantHandler,
  getOwnerDashboardAnalyticsHandler,
} from "../controller/restaurant.controller.js";

const router = express.Router();

router.get("/", getAllRestaurantsHandler);

// Protected routes that need to be matched before /:id
router.get("/my-restaurants/analytics", authenticate, authorize(["restaurant", "admin"]), getOwnerDashboardAnalyticsHandler);
router.get("/my-restaurants", authenticate, authorize(["restaurant", "admin"]), getMyRestaurantsHandler);

// Admin-only: get all restaurants (must be BEFORE /:id to avoid matching "admin" as id)
router.get("/admin/all", authenticate, authorize(["admin"]), adminGetAllRestaurantsHandler);

router.get("/:id", getRestaurantHandler);

// Protected routes
router.use(authenticate);

router.post("/", authorize(["restaurant", "admin"]), createRestaurantHandler);
router.put("/:id", authorize(["restaurant", "admin"]), updateRestaurantHandler);
router.delete("/:id", authorize(["restaurant", "admin"]), deleteRestaurantHandler);
router.get("/:id/orders", authorize(["restaurant", "admin"]), getRestaurantOrdersHandler);
router.patch("/:id/orders/:orderId/status", authorize(["restaurant", "admin"]), updateRestaurantOrderStatusHandler);

// Admin-only mutation routes
router.patch("/:id/approve", authorize(["admin"]), adminApproveRestaurantHandler);
router.patch("/:id/suspend", authorize(["admin"]), adminSuspendRestaurantHandler);
router.patch("/:id/reject", authorize(["admin"]), adminRejectRestaurantHandler);
router.delete("/:id/admin", authorize(["admin"]), adminDeleteRestaurantHandler);

export default router;

