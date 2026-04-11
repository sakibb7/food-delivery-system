import express from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  createRestaurantHandler,
  updateRestaurantHandler,
  deleteRestaurantHandler,
  getRestaurantHandler,
  getAllRestaurantsHandler,
} from "../controller/restaurant.controller.js";

const router = express.Router();

router.get("/", getAllRestaurantsHandler);
router.get("/:id", getRestaurantHandler);

// Protected routes
router.use(authenticate);

router.post("/", createRestaurantHandler);
router.put("/:id", updateRestaurantHandler);
router.delete("/:id", deleteRestaurantHandler);

export default router;
