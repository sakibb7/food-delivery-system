import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { isValidTransition } from "../utils/orderStateMachine.js";
import {
  ordersTable,
  orderItemsTable,
} from "../db/schema/orderSchema.js";
import { menuItemsTable } from "../db/schema/menuItemSchema.js";
import { restaurantsTable } from "../db/schema/restaurantSchema.js";
import { usersTable } from "../db/schema/userSchema.js";
import { riderProfilesTable } from "../db/schema/riderProfileSchema.js";
import { addressesTable } from "../db/schema/addressSchema.js";
import { getSettings } from "./settings.services.js";
import { validateCouponService, incrementCouponUsage } from "./coupon.services.js";

interface CreateOrderInput {
  restaurantId: number;
  items: { menuItemId: number; quantity: number }[];
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryLat?: number | undefined;
  deliveryLng?: number | undefined;
  addressId?: number | undefined;
  couponCode?: string | undefined;
  notes?: string | undefined;
  paymentMethod?: string | undefined;
}

export const createOrder = async (userId: number, data: CreateOrderInput) => {
  // 1. Fetch real menu item prices from DB to prevent price tampering
  const menuItemIds = data.items.map((i) => i.menuItemId);

  const menuItems = await db
    .select()
    .from(menuItemsTable)
    .where(
      and(
        inArray(menuItemsTable.id, menuItemIds),
        eq(menuItemsTable.restaurantId, data.restaurantId)
      )
    );

  // Verify all items exist and belong to the restaurant
  if (menuItems.length !== menuItemIds.length) {
    throw new Error("Some menu items were not found or don't belong to this restaurant");
  }

  // 2. Fetch restaurant for delivery fee & estimated time
  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, data.restaurantId))
    .limit(1);

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  // 3. Resolve delivery coordinates
  let deliveryLat = data.deliveryLat;
  let deliveryLng = data.deliveryLng;

  // If coordinates not provided directly, try to look up from addressId
  if ((!deliveryLat || !deliveryLng) && data.addressId) {
    const [address] = await db
      .select()
      .from(addressesTable)
      .where(and(eq(addressesTable.id, data.addressId), eq(addressesTable.userId, userId)))
      .limit(1);

    if (address && address.latitude && address.longitude) {
      deliveryLat = parseFloat(address.latitude);
      deliveryLng = parseFloat(address.longitude);
    }
  }

  // 4. Calculate pricing
  const menuItemMap = new Map(menuItems.map((mi) => [mi.id, mi]));

  let subtotal = 0;
  const orderItemsData = data.items.map((item) => {
    const menuItem = menuItemMap.get(item.menuItemId)!;
    const itemTotal = parseFloat(menuItem.price) * item.quantity;
    subtotal += itemTotal;

    return {
      menuItemId: item.menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
    };
  });

  const settings = await getSettings();
  const taxRate = settings.tax_rate !== undefined ? Number(settings.tax_rate) / 100 : 0.05;
  const platformBaseFee = settings.delivery_base_fee !== undefined ? Number(settings.delivery_base_fee) : 40;

  const restaurantDeliveryFee = parseFloat(restaurant.deliveryFee ?? "0");
  const deliveryFee = restaurantDeliveryFee > 0 ? restaurantDeliveryFee : platformBaseFee;
  const tax = Math.round(subtotal * taxRate * 100) / 100;

  // 4b. Validate & apply coupon if provided
  let discount = 0;
  let couponCode: string | null = null;

  if (data.couponCode) {
    const couponResult = await validateCouponService(data.couponCode, subtotal);
    discount = couponResult.discount;
    couponCode = couponResult.coupon.code;
  }

  const total = Math.round((subtotal + deliveryFee + tax - discount) * 100) / 100;

  // 4c. Calculate platform commission and restaurant earnings
  const commissionRate = settings.platform_commission_rate !== undefined ? Number(settings.platform_commission_rate) / 100 : 0.10;
  const platformCommission = Math.round(subtotal * commissionRate * 100) / 100;
  const restaurantEarnings = Math.round((subtotal - platformCommission) * 100) / 100;

  // 5. Insert order + items in a transaction
  const order = await db.transaction(async (tx) => {
    const [createdOrder] = await tx
      .insert(ordersTable)
      .values({
        userId,
        restaurantId: data.restaurantId,
        status: "pending",
        paymentMethod: (data.paymentMethod || "cod") as "cod" | "card" | "mobile_banking",
        paymentStatus: "pending",
        deliveryAddress: data.deliveryAddress,
        deliveryPhone: data.deliveryPhone,
        deliveryLat: deliveryLat?.toFixed(7) ?? null,
        deliveryLng: deliveryLng?.toFixed(7) ?? null,
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        tax: tax.toFixed(2),
        discount: discount.toFixed(2),
        couponCode,
        total: total.toFixed(2),
        platformCommission: platformCommission.toFixed(2),
        restaurantEarnings: restaurantEarnings.toFixed(2),
        notes: data.notes || null,
        estimatedDeliveryTime: restaurant.deliveryTime || "30-45 min",
      })
      .returning();

    if (!createdOrder) {
      throw new Error("Failed to create order");
    }

    // Insert order items
    await tx.insert(orderItemsTable).values(
      orderItemsData.map((item) => ({
        ...item,
        orderId: createdOrder.id,
      }))
    );

    // Increment coupon usage count
    if (couponCode) {
      // NOTE: Incrementing via service function might be tricky inside tx if it uses db instead of tx.
      // We should ideally do it inline here with tx to guarantee atomicity.
      // Wait, incrementCouponUsage from service uses db. We can't pass tx.
      // Let's do it directly here using tx.
      await tx
        .update(require("../db/schema/couponSchema.js").couponsTable)
        .set({ usedCount: sql`used_count + 1` })
        .where(eq(require("../db/schema/couponSchema.js").couponsTable.code, couponCode));
    }

    return createdOrder;
  });

  return order;
};

export const previewOrderPricing = async (userId: number, data: CreateOrderInput) => {
  const menuItemIds = data.items.map((i) => i.menuItemId);

  const menuItems = await db
    .select()
    .from(menuItemsTable)
    .where(
      and(
        inArray(menuItemsTable.id, menuItemIds),
        eq(menuItemsTable.restaurantId, data.restaurantId)
      )
    );

  if (menuItems.length !== menuItemIds.length) {
    throw new Error("Some menu items were not found or don't belong to this restaurant");
  }

  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, data.restaurantId))
    .limit(1);

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  const menuItemMap = new Map(menuItems.map((mi) => [mi.id, mi]));
  let subtotal = 0;
  data.items.forEach((item) => {
    const menuItem = menuItemMap.get(item.menuItemId)!;
    subtotal += parseFloat(menuItem.price) * item.quantity;
  });

  const settings = await getSettings();
  const taxRate = settings.tax_rate !== undefined ? Number(settings.tax_rate) / 100 : 0.05;
  const platformBaseFee = settings.delivery_base_fee !== undefined ? Number(settings.delivery_base_fee) : 40;

  const restaurantDeliveryFee = parseFloat(restaurant.deliveryFee ?? "0");
  const deliveryFee = restaurantDeliveryFee > 0 ? restaurantDeliveryFee : platformBaseFee;
  const tax = Math.round(subtotal * taxRate * 100) / 100;

  let discount = 0;
  let validCouponCode: string | null = null;

  if (data.couponCode) {
    try {
      const couponResult = await validateCouponService(data.couponCode, subtotal);
      discount = couponResult.discount;
      validCouponCode = couponResult.coupon.code;
    } catch (e) {
      // Allow previewing to proceed even if coupon is invalid, or you can throw error.
      // Usually, we want to know it failed.
      throw e;
    }
  }

  const total = Math.round((subtotal + deliveryFee + tax - discount) * 100) / 100;

  return {
    subtotal: subtotal.toFixed(2),
    deliveryFee: deliveryFee.toFixed(2),
    tax: tax.toFixed(2),
    discount: discount.toFixed(2),
    total: total.toFixed(2),
    couponCode: validCouponCode,
  };
};

export const getOrdersByUserId = async (userId: number) => {
  const orders = await db
    .select({
      id: ordersTable.id,
      status: ordersTable.status,
      paymentMethod: ordersTable.paymentMethod,
      paymentStatus: ordersTable.paymentStatus,
      total: ordersTable.total,
      subtotal: ordersTable.subtotal,
      deliveryFee: ordersTable.deliveryFee,
      tax: ordersTable.tax,
      createdAt: ordersTable.createdAt,
      estimatedDeliveryTime: ordersTable.estimatedDeliveryTime,
      deliveryLat: ordersTable.deliveryLat,
      deliveryLng: ordersTable.deliveryLng,
      restaurantId: ordersTable.restaurantId,
      restaurantName: restaurantsTable.name,
      restaurantLogo: restaurantsTable.logo,
      restaurantSlug: restaurantsTable.slug,
    })
    .from(ordersTable)
    .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
    .where(eq(ordersTable.userId, userId))
    .orderBy(desc(ordersTable.createdAt));

  return orders;
};

export const getOrderById = async (orderId: number, userId: number) => {
  const [order] = await db
    .select({
      id: ordersTable.id,
      userId: ordersTable.userId,
      restaurantId: ordersTable.restaurantId,
      riderId: ordersTable.riderId,
      status: ordersTable.status,
      paymentMethod: ordersTable.paymentMethod,
      paymentStatus: ordersTable.paymentStatus,
      deliveryAddress: ordersTable.deliveryAddress,
      deliveryPhone: ordersTable.deliveryPhone,
      subtotal: ordersTable.subtotal,
      deliveryFee: ordersTable.deliveryFee,
      tax: ordersTable.tax,
      total: ordersTable.total,
      notes: ordersTable.notes,
      estimatedDeliveryTime: ordersTable.estimatedDeliveryTime,
      deliveryLat: ordersTable.deliveryLat,
      deliveryLng: ordersTable.deliveryLng,
      discount: ordersTable.discount,
      couponCode: ordersTable.couponCode,
      createdAt: ordersTable.createdAt,
      updatedAt: ordersTable.updatedAt,
      restaurantName: restaurantsTable.name,
      restaurantLogo: restaurantsTable.logo,
      restaurantSlug: restaurantsTable.slug,
      restaurantPhone: restaurantsTable.phone,
    })
    .from(ordersTable)
    .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, userId)))
    .limit(1);

  if (!order) return null;

  // Fetch order items
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  return { ...order, items };
};

export const updateOrderStatus = async (
  orderId: number,
  userId: number,
  status: "cancelled"
) => {
  const [currentOrder] = await db
    .select({ status: ordersTable.status })
    .from(ordersTable)
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, userId)))
    .limit(1);

  if (!currentOrder) {
    throw new Error("Order not found");
  }

  if (!isValidTransition(currentOrder.status, status)) {
    throw new Error(`Invalid status transition from ${currentOrder.status} to ${status}`);
  }

  const [updatedOrder] = await db
    .update(ordersTable)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, userId)))
    .returning();

  return updatedOrder;
};

export const getAdminOrderById = async (orderId: number) => {
  const [order] = await db
    .select({
      id: ordersTable.id,
      userId: ordersTable.userId,
      restaurantId: ordersTable.restaurantId,
      riderId: ordersTable.riderId,
      status: ordersTable.status,
      paymentMethod: ordersTable.paymentMethod,
      paymentStatus: ordersTable.paymentStatus,
      deliveryAddress: ordersTable.deliveryAddress,
      deliveryPhone: ordersTable.deliveryPhone,
      subtotal: ordersTable.subtotal,
      deliveryFee: ordersTable.deliveryFee,
      tax: ordersTable.tax,
      total: ordersTable.total,
      notes: ordersTable.notes,
      estimatedDeliveryTime: ordersTable.estimatedDeliveryTime,
      deliveryLat: ordersTable.deliveryLat,
      deliveryLng: ordersTable.deliveryLng,
      createdAt: ordersTable.createdAt,
      updatedAt: ordersTable.updatedAt,
      pickedUpAt: ordersTable.pickedUpAt,
      deliveredAt: ordersTable.deliveredAt,
      // Customer info
      customerFirstName: usersTable.firstName,
      customerLastName: usersTable.lastName,
      customerEmail: usersTable.email,
      customerPhone: usersTable.phone,
      customerAvatar: usersTable.avatar,
      // Restaurant info
      restaurantName: restaurantsTable.name,
      restaurantLogo: restaurantsTable.logo,
      restaurantSlug: restaurantsTable.slug,
      restaurantPhone: restaurantsTable.phone,
    })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order) return null;

  // Fetch order items
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  // Fetch rider info if assigned
  let rider = null;
  if (order.riderId) {
    const riderAlias = usersTable;
    const [riderUser] = await db
      .select({
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        phone: usersTable.phone,
        avatar: usersTable.avatar,
        vehicleType: riderProfilesTable.vehicleType,
        vehicleMakeModel: riderProfilesTable.vehicleMakeModel,
        vehicleRegistration: riderProfilesTable.vehicleRegistration,
      })
      .from(usersTable)
      .leftJoin(riderProfilesTable, eq(usersTable.id, riderProfilesTable.userId))
      .where(eq(usersTable.id, order.riderId))
      .limit(1);

    if (riderUser) {
      rider = riderUser;
    }
  }

  return { ...order, items, rider };
};

export const getAllOrders = async () => {
  const orders = await db
    .select({
      id: ordersTable.id,
      status: ordersTable.status,
      paymentMethod: ordersTable.paymentMethod,
      paymentStatus: ordersTable.paymentStatus,
      total: ordersTable.total,
      subtotal: ordersTable.subtotal,
      deliveryFee: ordersTable.deliveryFee,
      tax: ordersTable.tax,
      createdAt: ordersTable.createdAt,
      estimatedDeliveryTime: ordersTable.estimatedDeliveryTime,
      deliveryLat: ordersTable.deliveryLat,
      deliveryLng: ordersTable.deliveryLng,
      restaurantId: ordersTable.restaurantId,
      restaurantName: restaurantsTable.name,
      userId: ordersTable.userId,
      customerName: sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`,
      customerEmail: usersTable.email,
    })
    .from(ordersTable)
    .leftJoin(restaurantsTable, eq(ordersTable.restaurantId, restaurantsTable.id))
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .orderBy(desc(ordersTable.createdAt));

  return orders;
};
