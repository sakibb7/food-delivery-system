import { eq, desc, and, gt, or, isNull, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { couponsTable } from "../db/schema/couponSchema.js";
import AppError from "../utils/AppError.js";
import { BAD_REQUEST, NOT_FOUND } from "../constants/http.js";

export const getCouponsService = async () => {
  return await db.select().from(couponsTable).orderBy(desc(couponsTable.createdAt));
};

export const getActiveCouponsService = async () => {
  return await db
    .select()
    .from(couponsTable)
    .where(
      and(
        eq(couponsTable.isActive, true),
        gt(couponsTable.expiryDate, new Date()),
        or(
          isNull(couponsTable.usageLimit),
          sql`${couponsTable.usedCount} < ${couponsTable.usageLimit}`
        )
      )
    )
    .orderBy(desc(couponsTable.createdAt));
};

export const validateCouponService = async (code: string, subtotal: number) => {
  const [coupon] = await db
    .select()
    .from(couponsTable)
    .where(eq(couponsTable.code, code.toUpperCase()))
    .limit(1);

  if (!coupon) {
    throw new AppError(NOT_FOUND, "Coupon code not found");
  }

  if (!coupon.isActive) {
    throw new AppError(BAD_REQUEST, "This coupon is no longer active");
  }

  if (new Date(coupon.expiryDate) <= new Date()) {
    throw new AppError(BAD_REQUEST, "This coupon has expired");
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError(BAD_REQUEST, "This coupon has reached its usage limit");
  }

  const minPurchase = coupon.minPurchase ? parseFloat(coupon.minPurchase) : 0;
  if (subtotal < minPurchase) {
    throw new AppError(BAD_REQUEST, `Minimum purchase of ৳${minPurchase} required for this coupon`);
  }

  // Calculate discount
  let discount = 0;
  const discountValue = parseFloat(coupon.discountValue);

  if (coupon.type === "percentage") {
    discount = (subtotal * discountValue) / 100;
    const maxDiscount = coupon.maxDiscount ? parseFloat(coupon.maxDiscount) : Infinity;
    discount = Math.min(discount, maxDiscount);
  } else {
    discount = discountValue;
  }

  // Discount can't exceed subtotal
  discount = Math.min(discount, subtotal);
  discount = Math.round(discount * 100) / 100;

  return {
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
      minPurchase: coupon.minPurchase,
      expiryDate: coupon.expiryDate,
    },
    discount,
  };
};

export const toggleCouponStatusService = async (id: number) => {
  const [existing] = await db
    .select()
    .from(couponsTable)
    .where(eq(couponsTable.id, id))
    .limit(1);

  if (!existing) {
    throw new AppError(NOT_FOUND, "Coupon not found");
  }

  const [updatedCoupon] = await db
    .update(couponsTable)
    .set({ isActive: !existing.isActive })
    .where(eq(couponsTable.id, id))
    .returning();

  return updatedCoupon;
};

export const incrementCouponUsage = async (code: string) => {
  await db
    .update(couponsTable)
    .set({ usedCount: sql`${couponsTable.usedCount} + 1` })
    .where(eq(couponsTable.code, code));
};

export const createCouponService = async (data: any) => {
  const [existing] = await db
    .select()
    .from(couponsTable)
    .where(eq(couponsTable.code, data.code))
    .limit(1);

  if (existing) {
    throw new AppError(BAD_REQUEST, "Coupon code already exists");
  }
  
  const [newCoupon] = await db.insert(couponsTable).values({
    code: data.code,
    type: data.type,
    discountValue: data.discountValue.toString(),
    maxDiscount: data.maxDiscount?.toString() || null,
    minPurchase: data.minPurchase?.toString() || null,
    expiryDate: new Date(data.expiryDate),
    usageLimit: data.usageLimit || null,
    isActive: data.isActive !== undefined ? data.isActive : true,
  }).returning();
  
  return newCoupon;
};

export const updateCouponService = async (id: number, data: any) => {
  const [existing] = await db
    .select()
    .from(couponsTable)
    .where(eq(couponsTable.id, id))
    .limit(1);

  if (!existing) {
    throw new AppError(NOT_FOUND, "Coupon not found");
  }
  
  const updateData: any = {};
  if (data.code !== undefined) updateData.code = data.code;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.discountValue !== undefined) updateData.discountValue = data.discountValue.toString();
  if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount?.toString() || null;
  if (data.minPurchase !== undefined) updateData.minPurchase = data.minPurchase?.toString() || null;
  if (data.expiryDate !== undefined) updateData.expiryDate = new Date(data.expiryDate);
  if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit || null;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  
  const [updatedCoupon] = await db
    .update(couponsTable)
    .set(updateData)
    .where(eq(couponsTable.id, id))
    .returning();
    
  return updatedCoupon;
};

export const deleteCouponService = async (id: number) => {
  const [deleted] = await db
    .delete(couponsTable)
    .where(eq(couponsTable.id, id))
    .returning();

  if (!deleted) {
    throw new AppError(NOT_FOUND, "Coupon not found");
  }
  return deleted;
};
