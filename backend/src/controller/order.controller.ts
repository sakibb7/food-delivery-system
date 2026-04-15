import { RequestHandler } from "express";
import catchErrors from "../utils/catchErrors.js";
import { OK, CREATED, NOT_FOUND, BAD_REQUEST } from "../constants/http.js";
import appAssert from "../utils/appAssert.js";
import { createOrderSchema, orderIdSchema } from "./order.schemas.js";
import {
  createOrder,
  getOrdersByUserId,
  getOrderById,
  updateOrderStatus,
} from "./order.services.js";

export const createOrderHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const data = createOrderSchema.parse(req.body);
    const userId = req.userId as number;

    const order = await createOrder(userId, data);

    return res.status(CREATED).json({
      message: "Order placed successfully",
      order,
    });
  }
);

export const getMyOrdersHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const userId = req.userId as number;
    const orders = await getOrdersByUserId(userId);

    return res.status(OK).json({
      orders,
    });
  }
);

export const getOrderDetailHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = orderIdSchema.parse(req.params);
    const userId = req.userId as number;

    const order = await getOrderById(Number(id), userId);
    appAssert(order, NOT_FOUND, "Order not found");

    return res.status(OK).json({
      order,
    });
  }
);

export const cancelOrderHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = orderIdSchema.parse(req.params);
    const userId = req.userId as number;

    // Check the order exists and is still pending
    const order = await getOrderById(Number(id), userId);
    appAssert(order, NOT_FOUND, "Order not found");
    appAssert(
      order.status === "pending",
      BAD_REQUEST,
      "Only pending orders can be cancelled"
    );

    const updatedOrder = await updateOrderStatus(Number(id), userId, "cancelled");

    return res.status(OK).json({
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
  }
);
