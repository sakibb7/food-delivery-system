import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { couponsTable } from "../db/schema/couponSchema.js";
import AppError from "../utils/AppError.js";
import { BAD_REQUEST, NOT_FOUND } from "../constants/http.js";

export const getCouponsService = async () => {
  return await db.select().from(couponsTable).orderBy(desc(couponsTable.createdAt));
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
