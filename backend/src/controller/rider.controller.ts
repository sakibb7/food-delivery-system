import { Request, Response } from "express";
import * as riderService from "./rider.services.js";
import { 
  createProfileSchema, 
  updateLocationSchema, 
  updateOnlineStatusSchema 
} from "./rider.schemas.js";

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
    const updated = await riderService.acceptOrder(userId, orderId);
    res.status(200).json({ data: updated[0], message: "Order accepted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
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
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
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
    const orderId = parseInt(req.params.id as string, 10);
    const order = await riderService.getOrderDetail(orderId);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.status(200).json({ data: order });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
