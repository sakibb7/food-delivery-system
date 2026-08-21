import express from "express";
import {
  getStripeConfigHandler,
  createPaymentIntentHandler,
  stripeWebhookHandler,
} from "../controller/stripe.controller.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

// Public — frontend needs the publishable key to initialize Stripe Elements
router.get("/config", getStripeConfigHandler);

// Authenticated — create a payment intent for an order
router.post("/create-payment-intent", authenticate, createPaymentIntentHandler);

// Public — Stripe webhook (raw body handled via express.raw in index.ts)
router.post("/webhook", stripeWebhookHandler);

export default router;
