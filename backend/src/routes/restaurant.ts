import express from "express";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import {
  createRestaurantHandler,
  updateRestaurantHandler,
  deleteRestaurantHandler,
  getRestaurantHandler,
  getAllRestaurantsHandler,
  getMyRestaurantsHandler,
} from "../controller/restaurant.controller.js";

const router = express.Router();

router.get("/", getAllRestaurantsHandler);

// Protected routes that need to be matched before /:id
router.get("/my-restaurants", authenticate, authorize(["restaurant", "admin"]), getMyRestaurantsHandler);

router.get("/:id", getRestaurantHandler);

// Protected routes
router.use(authenticate);

router.post("/", authorize(["restaurant", "admin"]), createRestaurantHandler);
router.put("/:id", authorize(["restaurant", "admin"]), updateRestaurantHandler);
router.delete("/:id", authorize(["restaurant", "admin"]), deleteRestaurantHandler);

export default router;
