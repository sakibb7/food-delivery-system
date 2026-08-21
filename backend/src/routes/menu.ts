import express from "express";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import {
  getMenuItemsHandler,
  createMenuItemHandler,
  updateMenuItemHandler,
  deleteMenuItemHandler,
} from "../controller/menu.controller.js";

const router = express.Router();

// Public: get all menu items for a restaurant
router.get("/:restaurantId", getMenuItemsHandler);

// Protected: manage menu items (restaurant owner / admin)
router.post(
  "/:restaurantId",
  authenticate,
  authorize(["restaurant", "admin"]),
  createMenuItemHandler
);

router.put(
  "/:restaurantId/:itemId",
  authenticate,
  authorize(["restaurant", "admin"]),
  updateMenuItemHandler
);

router.delete(
  "/:restaurantId/:itemId",
  authenticate,
  authorize(["restaurant", "admin"]),
  deleteMenuItemHandler
);

export default router;
