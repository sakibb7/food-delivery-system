import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
} from "../controller/coupon.controller.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/", authenticate, getCoupons);
router.post("/", authenticate, createCoupon);
router.patch("/:id", authenticate, updateCoupon);
router.delete("/:id", authenticate, deleteCoupon);

export default router;
