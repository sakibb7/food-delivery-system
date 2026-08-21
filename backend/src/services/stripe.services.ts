import Stripe from "stripe";
import { db } from "../db/index.js";
import { settingsTable } from "../db/schema/settingsSchema.js";
import { eq, and } from "drizzle-orm";
import { ordersTable } from "../db/schema/orderSchema.js";

/**
 * Dynamically retrieves the Stripe secret key from the settings table.
 * This allows admins to change keys from the dashboard without restarting the server.
 */
const getStripeInstance = async (): Promise<Stripe> => {
  const [setting] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.key, "stripe_secret_key"))
    .limit(1);

  if (!setting || !setting.value) {
    throw new Error("Stripe secret key is not configured. Please set it in the dashboard settings.");
  }

  return new Stripe(setting.value);
};

/**
 * Get the Stripe publishable key and enabled status for the frontend.
 */
export const getStripeConfig = async () => {
  const settings = await db.select().from(settingsTable);

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }

  return {
    enabled: settingsMap["stripe_enabled"] === "true",
    publishableKey: settingsMap["stripe_publishable_key"] || null,
  };
};

/**
 * Create a Stripe Payment Intent for a given order.
 * The order must already exist in the DB with paymentMethod "card".
 */
export const createPaymentIntent = async (orderId: number, userId: number) => {
  // Fetch the order
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, userId)))
    .limit(1);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.paymentMethod !== "card") {
    throw new Error("This order is not set for card payment");
  }

  if (order.paymentStatus === "paid") {
    throw new Error("This order has already been paid");
  }

  const stripe = await getStripeInstance();

  // Amount in smallest currency unit (e.g., cents for USD, paisa for BDT)
  // We multiply by 100 since the total is stored as decimal string
  const amountInSmallestUnit = Math.round(parseFloat(order.total) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInSmallestUnit,
    currency: "usd", // This could be made dynamic from settings
    metadata: {
      orderId: String(order.id),
      userId: String(order.userId),
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // Store the payment intent ID on the order for tracking
  await db
    .update(ordersTable)
    .set({ updatedAt: new Date() })
    .where(eq(ordersTable.id, orderId));

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};

/**
 * Handle Stripe webhook events.
 * Verifies the signature and processes payment status updates.
 */
export const handleStripeWebhook = async (
  rawBody: Buffer,
  signature: string
) => {
  // Get webhook secret from settings
  const [webhookSecretSetting] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.key, "stripe_webhook_secret"))
    .limit(1);

  if (!webhookSecretSetting || !webhookSecretSetting.value) {
    throw new Error("Stripe webhook secret is not configured");
  }

  const stripe = await getStripeInstance();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecretSetting.value
    );
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  // Handle specific event types
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await db
          .update(ordersTable)
          .set({
            paymentStatus: "paid",
            updatedAt: new Date(),
          })
          .where(eq(ordersTable.id, Number(orderId)));

        console.log(`Payment succeeded for order #${orderId}`);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await db
          .update(ordersTable)
          .set({
            paymentStatus: "failed",
            updatedAt: new Date(),
          })
          .where(eq(ordersTable.id, Number(orderId)));

        console.log(`Payment failed for order #${orderId}`);
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return { received: true };
};
