import { RequestHandler } from "express";
import catchErrors from "../utils/catchErrors.js";
import { OK, CREATED, NOT_FOUND, FORBIDDEN } from "../constants/http.js";
import appAssert from "../utils/appAssert.js";
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  menuItemIdSchema,
  restaurantIdParamSchema,
} from "./menu.schemas.js";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemsByRestaurantId,
  getMenuItemById,
} from "./menu.services.js";
import { getRestaurantById } from "./restaurant.services.js";

export const getMenuItemsHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { restaurantId } = restaurantIdParamSchema.parse(req.params);
    const items = await getMenuItemsByRestaurantId(Number(restaurantId));

    return res.status(OK).json({
      menuItems: items,
    });
  }
);

export const createMenuItemHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { restaurantId } = restaurantIdParamSchema.parse(req.params);
    const data = createMenuItemSchema.parse(req.body);
    const userId = req.userId as number;

    // Verify restaurant ownership
    const restaurant = await getRestaurantById(Number(restaurantId));
    appAssert(restaurant, NOT_FOUND, "Restaurant not found");
    appAssert(
      restaurant.ownerId === userId,
      FORBIDDEN,
      "Not authorized to manage this restaurant's menu"
    );

    const menuItem = await createMenuItem(Number(restaurantId), data as any);

    return res.status(CREATED).json({
      message: "Menu item created successfully",
      menuItem,
    });
  }
);

export const updateMenuItemHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { restaurantId } = restaurantIdParamSchema.parse(req.params);
    const { itemId } = menuItemIdSchema.parse(req.params);
    const data = updateMenuItemSchema.parse(req.body);
    const userId = req.userId as number;

    // Verify restaurant ownership
    const restaurant = await getRestaurantById(Number(restaurantId));
    appAssert(restaurant, NOT_FOUND, "Restaurant not found");
    appAssert(
      restaurant.ownerId === userId,
      FORBIDDEN,
      "Not authorized to manage this restaurant's menu"
    );

    // Verify menu item exists
    const existing = await getMenuItemById(Number(itemId));
    appAssert(existing, NOT_FOUND, "Menu item not found");
    appAssert(
      existing.restaurantId === Number(restaurantId),
      FORBIDDEN,
      "Menu item does not belong to this restaurant"
    );

    const updatedItem = await updateMenuItem(
      Number(itemId),
      Number(restaurantId),
      data as any
    );

    return res.status(OK).json({
      message: "Menu item updated successfully",
      menuItem: updatedItem,
    });
  }
);

export const deleteMenuItemHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { restaurantId } = restaurantIdParamSchema.parse(req.params);
    const { itemId } = menuItemIdSchema.parse(req.params);
    const userId = req.userId as number;

    // Verify restaurant ownership
    const restaurant = await getRestaurantById(Number(restaurantId));
    appAssert(restaurant, NOT_FOUND, "Restaurant not found");
    appAssert(
      restaurant.ownerId === userId,
      FORBIDDEN,
      "Not authorized to manage this restaurant's menu"
    );

    await deleteMenuItem(Number(itemId), Number(restaurantId));

    return res.status(OK).json({
      message: "Menu item deleted successfully",
    });
  }
);
