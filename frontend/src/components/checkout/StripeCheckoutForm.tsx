"use client";

import React, { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck } from "lucide-react";

interface StripeCheckoutFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  total: number;
}

export default function StripeCheckoutForm({
  onSuccess,
  onError,
  total,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) return;

    // Check for redirect result (e.g., from 3D Secure)
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (clientSecret) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        switch (paymentIntent?.status) {
          case "succeeded":
            onSuccess();
            break;
          case "processing":
            setMessage("Your payment is processing.");
            break;
          case "requires_payment_method":
            setMessage("Your payment was not successful, please try again.");
            break;
          default:
            setMessage("Something went wrong.");
            break;
        }
      });
    }
  }, [stripe, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An error occurred.");
        onError(error.message || "Payment failed.");
      } else {
        setMessage("An unexpected error occurred.");
        onError("An unexpected error occurred.");
      }
    } else {
      // Payment succeeded without redirect
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {message && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-indigo-600/40 flex justify-center items-center gap-2 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Processing...
          </>
        ) : (
          <>
            <ShieldCheck size={20} />
            Pay ৳{total.toFixed(2)}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck size={14} />
        <span>Secured by Stripe. Your payment info is encrypted.</span>
      </div>
    </form>
  );
}
