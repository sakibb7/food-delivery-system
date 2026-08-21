import { RequestHandler } from "express";
import catchErrors from "../utils/catchErrors.js";
import { OK, CREATED, NOT_FOUND, BAD_REQUEST } from "../constants/http.js";
import appAssert from "../utils/appAssert.js";
import * as payoutService from "../services/payout.services.js";
import { db } from "../db/index.js";
import { restaurantsTable } from "../db/schema/restaurantSchema.js";
import { eq, and } from "drizzle-orm";
import { createPayoutSchema, updatePayoutStatusSchema } from "../schema/payout.schemas.js";

// ── Restaurant owner endpoints ──────────────────────────────────────────────

export const getOwnerEarningsHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const userId = req.userId as number;
    const earnings = await payoutService.getOwnerEarnings(userId);

    return res.status(OK).json(earnings);
  }
);

export const getOwnerPayoutsHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const userId = req.userId as number;
    const payouts = await payoutService.getOwnerPayouts(userId);

    return res.status(OK).json({ payouts });
  }
);

export const getRestaurantOrderEarningsHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const restaurantId = Number(req.params.id);
    const ownerId = req.userId as number;
    appAssert(restaurantId, BAD_REQUEST, "Restaurant ID is required");

    const [restaurant] = await db
      .select()
      .from(restaurantsTable)
      .where(and(eq(restaurantsTable.id, restaurantId), eq(restaurantsTable.ownerId, ownerId)))
      .limit(1);

    appAssert(restaurant, NOT_FOUND, "Restaurant not found or unauthorized");

    const orders = await payoutService.getRestaurantOrderEarnings(restaurantId);

    return res.status(OK).json({ orders });
  }
);

// ── Admin endpoints ─────────────────────────────────────────────────────────

export const requestPayoutHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const restaurantId = Number(req.params.id);
    const ownerId = req.userId as number;
    // Omit fields that are admin-only or not required for requests
    const data = createPayoutSchema.omit({ restaurantId: true, commissionAmount: true, periodStart: true, periodEnd: true, adminNotes: true }).parse(req.body);

    const payout = await payoutService.createPayoutRequest(restaurantId, ownerId, data);

    return res.status(CREATED).json({
      message: "Payout requested successfully",
      payout,
    });
  }
);

export const adminGetAllPayoutsHandler: RequestHandler = catchErrors(
  async (_req, res) => {
    const payouts = await payoutService.getAllPayouts();
    const summary = await payoutService.getPayoutSummary();

    return res.status(OK).json({ payouts, summary });
  }
);

export const adminGetRestaurantBalancesHandler: RequestHandler = catchErrors(
  async (_req, res) => {
    const restaurants = await payoutService.getRestaurantBalancesForAdmin();

    return res.status(OK).json({ restaurants });
  }
);

export const adminCreatePayoutHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const data = createPayoutSchema.parse(req.body);

    const payoutData: Parameters<typeof payoutService.createPayout>[0] = {
      restaurantId: data.restaurantId,
      amount: data.amount,
      commissionAmount: data.commissionAmount,
      periodStart: data.periodStart ? new Date(data.periodStart) : new Date(),
      periodEnd: data.periodEnd ? new Date(data.periodEnd) : new Date(),
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountHolderName: data.accountHolderName,
    };
    
    if (data.adminNotes !== undefined) {
      payoutData.adminNotes = data.adminNotes;
    }

    const payout = await payoutService.createPayout(payoutData);

    return res.status(CREATED).json({
      message: "Payout created successfully",
      data: payout,
    });
  }
);

export const adminUpdatePayoutStatusHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const payoutId = Number(req.params.id);
    const data = updatePayoutStatusSchema.parse(req.body);

    const updated = await payoutService.updatePayoutStatus(
      payoutId,
      data.status,
      data.transactionRef,
      data.adminNotes
    );

    appAssert(updated, NOT_FOUND, "Payout not found");

    return res.status(OK).json({
      message: `Payout marked as ${data.status}`,
      data: updated,
    });
  }
);
