import { Request, Response, NextFunction } from "express";
import { createCouponSchema, updateCouponSchema } from "./coupon.schemas.js";
import {
  createCouponService,
  deleteCouponService,
  getCouponsService,
  updateCouponService,
} from "./coupon.services.js";

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
