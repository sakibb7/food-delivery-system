import { RequestHandler } from "express";
import catchErrors from "../utils/catchErrors.js";
import { OK, CREATED, NOT_FOUND, FORBIDDEN } from "../constants/http.js";
import appAssert from "../utils/appAssert.js";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  restaurantIdSchema,
  orderStatusSchema,
  orderIdSchema,
} from "./restaurant.schemas.js";
import {
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantById,
  getAllRestaurants,
  getMyRestaurants,
  getRestaurantOrders,
  updateRestaurantOrderStatus,
  getAllRestaurantsAdmin,
  approveRestaurant,
  suspendRestaurant,
  rejectRestaurant,
  adminDeleteRestaurant,
} from "./restaurant.services.js";

export const createRestaurantHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const data = createRestaurantSchema.parse(req.body);
    const userId = req.userId as number;

    const restaurant = await createRestaurant(userId, data);

    return res.status(CREATED).json({
      message: "Restaurant created successfully",
      restaurant,
    });
  }
);

export const getRestaurantHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = restaurantIdSchema.parse(req.params);
    const restaurant = await getRestaurantById(Number(id));

    appAssert(restaurant, NOT_FOUND, "Restaurant not found");

    return res.status(OK).json({
      restaurant,
    });
  }
);

export const getAllRestaurantsHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const restaurants = await getAllRestaurants();

    return res.status(OK).json({
      restaurants,
    });
  }
);

export const getMyRestaurantsHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const userId = req.userId as number;
    const restaurants = await getMyRestaurants(userId);

    return res.status(OK).json({
      restaurants,
    });
  }
);

export const updateRestaurantHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = restaurantIdSchema.parse(req.params);
    const data = updateRestaurantSchema.parse(req.body);
    const userId = req.userId as number;

    // Check existing
    const existing = await getRestaurantById(Number(id));
    appAssert(existing, NOT_FOUND, "Restaurant not found");
    appAssert(existing.ownerId === userId, FORBIDDEN, "Not authorized to update this restaurant");

    const updatedRestaurant = await updateRestaurant(Number(id), userId, data as any);

    return res.status(OK).json({
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant,
    });
  }
);

export const deleteRestaurantHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = restaurantIdSchema.parse(req.params);
    const userId = req.userId as number;

    // Check existing
    const existing = await getRestaurantById(Number(id));
    appAssert(existing, NOT_FOUND, "Restaurant not found");
    appAssert(existing.ownerId === userId, FORBIDDEN, "Not authorized to delete this restaurant");

    await deleteRestaurant(Number(id), userId);

    return res.status(OK).json({
      message: "Restaurant deleted successfully",
    });
  }
);

export const getRestaurantOrdersHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = restaurantIdSchema.parse(req.params);
    const userId = req.userId as number;

    const orders = await getRestaurantOrders(Number(id), userId);
    appAssert(orders, NOT_FOUND, "Restaurant not found or unauthorized");

    return res.status(OK).json({ orders });
  }
);

export const updateRestaurantOrderStatusHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = restaurantIdSchema.parse(req.params);
    const { orderId } = orderIdSchema.parse(req.params);
    const { status } = orderStatusSchema.parse(req.body);
    const userId = req.userId as number;

    const updatedOrder = await updateRestaurantOrderStatus(
      Number(id),
      Number(orderId),
      userId,
      status as any
    );

    return res.status(OK).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  }
);

// ── Admin-only handlers ───────────────────────────────────────────────────────

export const adminGetAllRestaurantsHandler: RequestHandler = catchErrors(
  async (_req, res) => {
    const restaurants = await getAllRestaurantsAdmin();

    return res.status(OK).json({
      restaurants,
    });
  }
);

export const adminApproveRestaurantHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = restaurantIdSchema.parse(req.params);

    const existing = await getRestaurantById(Number(id));
    appAssert(existing, NOT_FOUND, "Restaurant not found");

    const restaurant = await approveRestaurant(Number(id));

    return res.status(OK).json({
      message: "Restaurant approved successfully",
      restaurant,
    });
  }
);

export const adminSuspendRestaurantHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = restaurantIdSchema.parse(req.params);

    const existing = await getRestaurantById(Number(id));
    appAssert(existing, NOT_FOUND, "Restaurant not found");

    const restaurant = await suspendRestaurant(Number(id));

    return res.status(OK).json({
      message: "Restaurant suspended successfully",
      restaurant,
    });
  }
);

export const adminRejectRestaurantHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = restaurantIdSchema.parse(req.params);

    const existing = await getRestaurantById(Number(id));
    appAssert(existing, NOT_FOUND, "Restaurant not found");

    const restaurant = await rejectRestaurant(Number(id));

    return res.status(OK).json({
      message: "Restaurant application rejected",
      restaurant,
    });
  }
);

export const adminDeleteRestaurantHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { id } = restaurantIdSchema.parse(req.params);

    const existing = await getRestaurantById(Number(id));
    appAssert(existing, NOT_FOUND, "Restaurant not found");

    await adminDeleteRestaurant(Number(id));

    return res.status(OK).json({
      message: "Restaurant deleted successfully",
    });
  }
);

