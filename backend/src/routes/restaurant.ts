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
  getMyRestaurantByIdHandler,
  getRestaurantOrdersHandler,
  updateRestaurantOrderStatusHandler,
  markOrderSelfDeliveredHandler,
  adminGetAllRestaurantsHandler,
  adminApproveRestaurantHandler,
  adminSuspendRestaurantHandler,
  adminRejectRestaurantHandler,
  adminDeleteRestaurantHandler,
  getOwnerDashboardAnalyticsHandler,
  adminGetRestaurantDetailsHandler,
  searchRestaurantsHandler,
  getPopularCuisinesHandler,
  getCitiesWithCountsHandler,
} from "../controller/restaurant.controller.js";
import {
  getOwnerEarningsHandler,
  getOwnerPayoutsHandler,
  getRestaurantOrderEarningsHandler,
  requestPayoutHandler,
  adminGetAllPayoutsHandler,
  adminGetRestaurantBalancesHandler,
  adminCreatePayoutHandler,
  adminUpdatePayoutStatusHandler,
} from "../controller/payout.controller.js";

const router = express.Router();

router.get("/", getAllRestaurantsHandler);
router.get("/search", searchRestaurantsHandler);
router.get("/cuisines", getPopularCuisinesHandler);
router.get("/cities", getCitiesWithCountsHandler);

// Protected routes that need to be matched before /:id
router.get("/my-restaurants/analytics", authenticate, authorize(["restaurant", "admin"]), getOwnerDashboardAnalyticsHandler);
router.get("/my-restaurants/earnings", authenticate, authorize(["restaurant", "admin"]), getOwnerEarningsHandler);
router.get("/my-restaurants/payouts", authenticate, authorize(["restaurant", "admin"]), getOwnerPayoutsHandler);
router.get("/my-restaurants", authenticate, authorize(["restaurant", "admin"]), getMyRestaurantsHandler);
router.get("/my-restaurants/:id", authenticate, authorize(["restaurant", "admin"]), getMyRestaurantByIdHandler);

// Admin-only: get all restaurants (must be BEFORE /:id to avoid matching "admin" as id)
router.get("/admin/all", authenticate, authorize(["admin"]), adminGetAllRestaurantsHandler);
router.get("/admin/payouts", authenticate, authorize(["admin"]), adminGetAllPayoutsHandler);
router.get("/admin/balances", authenticate, authorize(["admin"]), adminGetRestaurantBalancesHandler);
router.post("/admin/payouts", authenticate, authorize(["admin"]), adminCreatePayoutHandler);
router.patch("/admin/payouts/:id", authenticate, authorize(["admin"]), adminUpdatePayoutStatusHandler);
router.get("/admin/:id", authenticate, authorize(["admin"]), adminGetRestaurantDetailsHandler);

router.get("/:id", getRestaurantHandler);

// Protected routes
router.use(authenticate);

router.post("/", authorize(["restaurant", "admin"]), createRestaurantHandler);
router.put("/:id", authorize(["restaurant", "admin"]), updateRestaurantHandler);
router.delete("/:id", authorize(["restaurant", "admin"]), deleteRestaurantHandler);
router.get("/:id/orders", authorize(["restaurant", "admin"]), getRestaurantOrdersHandler);
router.get("/:id/order-earnings", authorize(["restaurant", "admin"]), getRestaurantOrderEarningsHandler);
router.post("/:id/payouts", authorize(["restaurant", "admin"]), requestPayoutHandler);
router.patch("/:id/orders/:orderId/status", authorize(["restaurant", "admin"]), updateRestaurantOrderStatusHandler);
router.patch("/:id/orders/:orderId/self-deliver", authorize(["restaurant", "admin"]), markOrderSelfDeliveredHandler);

// Admin-only mutation routes
router.patch("/:id/approve", authorize(["admin"]), adminApproveRestaurantHandler);
router.patch("/:id/suspend", authorize(["admin"]), adminSuspendRestaurantHandler);
router.patch("/:id/reject", authorize(["admin"]), adminRejectRestaurantHandler);
router.delete("/:id/admin", authorize(["admin"]), adminDeleteRestaurantHandler);

export default router;

