import { Request, Response, NextFunction } from "express";
import { createCouponSchema, updateCouponSchema } from "../schema/coupon.schemas.js";
import {
  createCouponService,
  deleteCouponService,
  getActiveCouponsService,
  getCouponsService,
  toggleCouponStatusService,
  updateCouponService,
  validateCouponService,
} from "../services/coupon.services.js";

export const getCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const coupons = await getCouponsService();
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

export const getActiveCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const coupons = await getActiveCouponsService();
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }
    if (!subtotal || typeof subtotal !== "number" || subtotal <= 0) {
      return res.status(400).json({ success: false, message: "Valid subtotal is required" });
    }

    const result = await validateCouponService(code, subtotal);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const toggleCouponStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const coupon = await toggleCouponStatusService(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? "activated" : "deactivated"} successfully`,
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = createCouponSchema.parse(req.body);
    const coupon = await createCouponService(validatedData);
    res.status(201).json({ success: true, message: "Coupon created successfully", coupon });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const validatedData = updateCouponSchema.parse(req.body);
    const coupon = await updateCouponService(id, validatedData);
    res.status(200).json({ success: true, message: "Coupon updated successfully", coupon });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    await deleteCouponService(id);
    res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    next(error);
  }
};
