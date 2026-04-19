import express from "express";
import {
  createRestaurantReviewHandler,
  createRiderReviewHandler,
  getRestaurantReviewsHandler,
  getRiderReviewsHandler,
  getOrderReviewStatusHandler,
} from "../controller/review.controller.js";

const router = express.Router();

// Public: anyone can read reviews
router.get("/restaurant/:id", getRestaurantReviewsHandler);
router.get("/rider/:id", getRiderReviewsHandler);

// Authenticated: only logged-in users can post reviews or check status
// (auth is applied at the mount level in index.ts for POST routes,
//  but GET /status also needs auth — we handle that below)
router.post("/restaurant", createRestaurantReviewHandler);
router.post("/rider", createRiderReviewHandler);
router.get("/order/:id/status", getOrderReviewStatusHandler);

export default router;
