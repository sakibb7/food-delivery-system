import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getActiveCoupons,
  getCoupons,
  toggleCouponStatus,
  updateCoupon,
  validateCoupon,
} from "../controller/coupon.controller.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// Public-ish (any authenticated user)
router.get("/active", authenticate, getActiveCoupons);
router.post("/validate", authenticate, validateCoupon);

// Admin-only
router.get("/", authenticate, authorize(["admin"]), getCoupons);
router.post("/", authenticate, authorize(["admin"]), createCoupon);
router.patch("/:id", authenticate, authorize(["admin"]), updateCoupon);
router.patch("/:id/toggle", authenticate, authorize(["admin"]), toggleCouponStatus);
router.delete("/:id", authenticate, authorize(["admin"]), deleteCoupon);

export default router;
