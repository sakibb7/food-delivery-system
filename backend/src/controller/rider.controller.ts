import { Request, Response } from "express";
import * as riderService from "../services/rider.services.js";
import {
  createProfileSchema,
  updateLocationSchema,
  updateOnlineStatusSchema
} from "../schema/rider.schemas.js";
import catchErrors from "../utils/catchErrors.js";
import appAssert from "../utils/appAssert.js";
import { OK, NOT_FOUND } from "../constants/http.js";

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const profile = await riderService.getRiderProfile(userId);
    if (!profile) {
      res.status(404).json({ message: "Rider profile not found" });
      return;
    }
    res.status(200).json({ data: profile });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const parsedBody = createProfileSchema.parse(req.body);
    const updated = await riderService.createOrUpdateRiderProfile(userId, parsedBody);
    res.status(200).json({ data: updated[0], message: "Profile updated successfully" });
  } catch (error) {
    res.status(400).json({ message: "Validation or server error", error });
  }
};

export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { lat, lng } = updateLocationSchema.parse(req.body);
    const updated = await riderService.updateRiderLocation(userId, lat, lng);
    res.status(200).json({ data: updated[0] });
  } catch (error) {
    res.status(400).json({ message: "Invalid location data", error });
  }
};

export const updateOnlineStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { isOnline } = updateOnlineStatusSchema.parse(req.body);

    const profile = await riderService.getRiderProfile(userId);
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    if (isOnline && profile.approvalStatus !== "approved") {
      res.status(403).json({ message: "Account not verified. Cannot go online." });
      return;
    }

    const updated = await riderService.updateRiderOnlineStatus(userId, isOnline);
    res.status(200).json({ data: updated[0] });
  } catch (error) {
    res.status(400).json({ message: "Error updating status", error });
  }
};

export const getAvailableOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await riderService.getAvailableOrders();
    res.status(200).json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const acceptOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const orderId = parseInt(req.params.id as string, 10);

    // Verify rider is approved and online before accepting
    const profile = await riderService.getRiderProfile(userId);
    if (!profile) {
      res.status(404).json({ message: "Rider profile not found" });
      return;
    }
    if (profile.approvalStatus !== "approved") {
      res.status(403).json({ message: "Your account is not approved yet" });
      return;
    }
    if (!profile.isOnline) {
      res.status(400).json({ message: "You must be online to accept orders" });
      return;
    }

    const orderDetail = await riderService.acceptOrder(userId, orderId);
    res.status(200).json({ data: orderDetail, message: "Order accepted" });
  } catch (error: any) {
    if (error.message === "Order is no longer available") {
      res.status(409).json({ message: "Order is no longer available. Another rider may have already accepted it." });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
};

export const pickupOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const orderId = parseInt(req.params.id as string, 10);
    const updated = await riderService.pickupOrder(userId, orderId);
    res.status(200).json({ data: updated[0], message: "Order picked up" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deliverOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const orderId = parseInt(req.params.id as string, 10);
    const updated = await riderService.deliverOrder(userId, orderId);
    res.status(200).json({ data: updated[0], message: "Order delivered" });
  } catch (error: any) {
    if (error.message === "Order not found or not assigned to this rider") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const history = await riderService.getRiderHistory(userId);
    res.status(200).json({ data: history });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getEarnings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const history = await riderService.getRiderHistory(userId);

    // Calculate simple earnings
    const totalEarnings = history.reduce((acc, order) => acc + Number(order.riderEarnings || 0), 0);
    const deliveries = history.length;

    res.status(200).json({
      data: {
        totalEarnings,
        deliveries,
        history
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getOrderDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const orderId = parseInt(req.params.id as string, 10);
    const order = await riderService.getOrderDetail(orderId, userId);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.status(200).json({ data: order });
  } catch (error: any) {
    if (error.message === "You are not authorized to view this order") {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
};

// ── Admin-only handlers ───────────────────────────────────────────────────────

export const adminGetAllRidersHandler = catchErrors(async (_req, res) => {
  const riders = await riderService.getAllRidersForAdmin();

  return res.status(OK).json({ riders });
});

export const adminGetRiderDetailsHandler = catchErrors(async (req, res) => {
  const riderId = Number(req.params.id);
  appAssert(riderId, 400, "Rider ID is required");

  const data = await riderService.getRiderDetailsForAdmin(riderId);
  appAssert(data, NOT_FOUND, "Rider not found");

  return res.status(OK).json(data);
});

// ── Withdrawal handlers ───────────────────────────────────────────────────────

export const getAvailableBalanceHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const balance = await riderService.getAvailableBalance(userId);
    res.status(200).json({ data: { availableBalance: balance } });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const createWithdrawalHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { amount, bankName, accountNumber, accountHolderName, branchName, riderNotes } = req.body;

    if (!amount || !bankName || !accountNumber || !accountHolderName) {
      res.status(400).json({ message: "Amount, bank name, account number, and account holder name are required" });
      return;
    }

    if (Number(amount) <= 0) {
      res.status(400).json({ message: "Amount must be greater than zero" });
      return;
    }

    const withdrawal = await riderService.createWithdrawal(userId, {
      amount: Number(amount),
      bankName,
      accountNumber,
      accountHolderName,
      branchName,
      riderNotes,
    });

    res.status(201).json({ data: withdrawal, message: "Withdrawal request submitted successfully" });
  } catch (error: any) {
    if (error.message === "Insufficient balance") {
      res.status(400).json({ message: "Insufficient balance for this withdrawal" });
    } else if (error.message === "Amount must be greater than zero") {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
};

export const getWithdrawalHistoryHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const withdrawals = await riderService.getRiderWithdrawals(userId);
    res.status(200).json({ data: withdrawals });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const adminUpdateRiderApprovalStatusHandler = catchErrors(async (req: Request, res: Response) => {
  const riderId = Number(req.params.id);
  appAssert(riderId, 400, "Rider ID is required");

  const { approvalStatus } = req.body;
  appAssert(["pending", "approved", "rejected"].includes(approvalStatus), 400, "Invalid approval status");

  const updated = await riderService.updateRiderApprovalStatusForAdmin(riderId, approvalStatus);
  
  return res.status(OK).json({ message: "Rider approval status updated", data: updated });
});

