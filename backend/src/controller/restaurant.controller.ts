import { RequestHandler } from "express";
import catchErrors from "../utils/catchErrors.js";
import { OK, CREATED, NOT_FOUND, FORBIDDEN } from "../constants/http.js";
import appAssert from "../utils/appAssert.js";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  restaurantIdSchema,
} from "./restaurant.schemas.js";
import {
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantById,
  getAllRestaurants,
} from "./restaurant.services.js";

export const createRestaurantHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const data = createRestaurantSchema.parse(req.body);
    const userId = req.userId as number;

    const restaurant = await createRestaurant(userId, data as any);

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
