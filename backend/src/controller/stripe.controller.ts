import { Request, Response, RequestHandler } from "express";
import catchErrors from "../utils/catchErrors.js";
import { OK, CREATED, BAD_REQUEST } from "../constants/http.js";
import {
  createPaymentIntent,
  getStripeConfig,
  handleStripeWebhook,
} from "../services/stripe.services.js";

/**
 * GET /api/v1/stripe/config
 * Public endpoint — returns Stripe publishable key and enabled status.
 * The frontend uses this to initialize Stripe Elements.
 */
export const getStripeConfigHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const config = await getStripeConfig();

    return res.status(OK).json(config);
  }
);

/**
 * POST /api/v1/stripe/create-payment-intent
 * Authenticated — creates a Stripe Payment Intent for a given order.
 * Body: { orderId: number }
 */
export const createPaymentIntentHandler: RequestHandler = catchErrors(
  async (req, res) => {
    const { orderId } = req.body;

    if (!orderId || typeof orderId !== "number") {
      return res.status(BAD_REQUEST).json({ message: "orderId is required and must be a number" });
    }

    const userId = req.userId as number;
    const result = await createPaymentIntent(orderId, userId);

    return res.status(CREATED).json(result);
  }
);

/**
 * POST /api/v1/stripe/webhook
 * Public — Stripe sends events here.
 * Must use raw body (not JSON parsed) for signature verification.
 */
export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    return res.status(BAD_REQUEST).json({ message: "Missing stripe-signature header" });
  }

  try {
    const result = await handleStripeWebhook(req.body, signature);
    return res.status(OK).json(result);
  } catch (err: any) {
    console.error("Stripe webhook error:", err.message);
    return res.status(BAD_REQUEST).json({ message: err.message });
  }
};
