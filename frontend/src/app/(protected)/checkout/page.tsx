"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  Banknote,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Home,
  Briefcase,
  Building2,
  Tag,
  X,
  CreditCard,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import { privateInstance, publicInstance } from "@/configs/axiosConfig";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeCheckoutForm from "@/components/checkout/StripeCheckoutForm";

interface SavedAddress {
  id: number;
  label: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  zipcode: string | null;
  latitude: string | null;
  longitude: string | null;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const cart = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: string;
    discountValue: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  // Fetch Stripe config (publishable key + enabled status)
  const { data: stripeConfig } = useGetQuery<{ enabled: boolean; publishableKey: string | null }>({
    url: "/stripe/config",
    queryKey: "stripe-config",
    isPublic: true,
  });

  const stripeEnabled = stripeConfig?.enabled && !!stripeConfig?.publishableKey;

  // Initialize Stripe when config is available
  useEffect(() => {
    if (stripeConfig?.enabled && stripeConfig?.publishableKey) {
      setStripePromise(loadStripe(stripeConfig.publishableKey));
    }
  }, [stripeConfig]);

  const [pricing, setPricing] = useState({ subtotal: 0, deliveryFee: 0, tax: 0, discount: 0, total: 0 });
  const [pricingLoading, setPricingLoading] = useState(true);

  // Fetch saved addresses
  const { data: addressesData, isLoading: addressesLoading } = useGetQuery<{ addresses: SavedAddress[] }>({
    url: "/address",
    queryKey: "addresses",
  });
  const savedAddresses = addressesData?.addresses || [];

  // Auto-select default address
  useEffect(() => {
    if (savedAddresses.length > 0 && selectedAddressId === null) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault);
      setSelectedAddressId(defaultAddr?.id || savedAddresses[0].id);
    }
  }, [savedAddresses, selectedAddressId]);

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId);
  const deliveryAddress = selectedAddress
    ? [selectedAddress.address, selectedAddress.city, selectedAddress.country].filter(Boolean).join(", ")
    : "";

  useEffect(() => {
    const fetchPricing = async () => {
      if (!cart.items.length || !cart.restaurantId) return;
      setPricingLoading(true);
      try {
        const res = await privateInstance.post("/order/preview", {
          restaurantId: cart.restaurantId,
          items: cart.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
          couponCode: appliedCoupon?.code || undefined,
          deliveryAddress: "Preview Address",
          deliveryPhone: "000000",
        });
        setPricing({
          subtotal: Number(res.data.pricing.subtotal),
          deliveryFee: Number(res.data.pricing.deliveryFee),
          tax: Number(res.data.pricing.tax),
          discount: Number(res.data.pricing.discount),
          total: Number(res.data.pricing.total),
        });
      } catch (err) {
        console.error("Failed to fetch pricing:", err);
      } finally {
        setPricingLoading(false);
      }
    };
    
    // debounce slightly
    const timeoutId = setTimeout(() => fetchPricing(), 300);
    return () => clearTimeout(timeoutId);
  }, [cart.items, cart.restaurantId, appliedCoupon]);

  const { subtotal, deliveryFee, tax, discount, total } = pricing;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await privateInstance.post("/coupon/validate", {
        code: couponCode.trim().toUpperCase(),
        subtotal,
      });
      setAppliedCoupon({
        code: res.data.coupon.code,
        discount: res.data.discount,
        type: res.data.coupon.type,
        discountValue: res.data.coupon.discountValue,
      });
      setCouponCode("");
      toast.success(`Coupon applied! You save ৳${res.data.discount.toFixed(0)}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Invalid coupon code";
      setCouponError(msg);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handlePlaceOrder = async () => {
    if (!cart.items.length || !cart.restaurantId) return;

    if (!deliveryAddress || !selectedAddress) {
      toast.error("Please add a delivery address to proceed.");
      return;
    }

    if (!user?.phone) {
      toast.error("Please add a phone number in your profile settings.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Create the order
      const res = await privateInstance.post("/order", {
        restaurantId: cart.restaurantId,
        items: cart.items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        deliveryAddress,
        deliveryPhone: user?.phone,
        deliveryLat: selectedAddress?.latitude ? parseFloat(selectedAddress.latitude) : undefined,
        deliveryLng: selectedAddress?.longitude ? parseFloat(selectedAddress.longitude) : undefined,
        addressId: selectedAddress?.id,
        couponCode: appliedCoupon?.code || undefined,
        notes: notes || undefined,
        paymentMethod,
      });

      const orderId = res.data.order?.id;

      // Step 2: If card payment, create a payment intent
      if (paymentMethod === "card" && orderId) {
        try {
          const intentRes = await privateInstance.post("/stripe/create-payment-intent", {
            orderId,
          });

          setClientSecret(intentRes.data.clientSecret);
          setPendingOrderId(orderId);
          // Don't clear cart yet — wait for payment to succeed
          setIsSubmitting(false);
          return;
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data
              ?.message || "Failed to initiate payment. Please try again.";
          toast.error(msg);
          setIsSubmitting(false);
          return;
        }
      }

      // COD flow — order is done
      cart.clearCart();
      toast.success("Order placed successfully!");
      router.push(orderId ? `/orders/${orderId}` : "/orders");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to place order. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStripeSuccess = () => {
    cart.clearCart();
    toast.success("Payment successful! Order confirmed.");
    router.push(pendingOrderId ? `/orders/${pendingOrderId}` : "/orders");
  };

  const handleStripeError = (message: string) => {
    toast.error(message);
  };

  const getAddressIcon = (label: string) => {
    const iconMap: Record<string, React.ElementType> = { Home, Work: Briefcase, Other: Building2 };
    return iconMap[label] || Building2;
  };

  // Empty cart state
  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center font-sans">
        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-gray-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          Your cart is empty
        </h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Looks like you haven&apos;t added any items yet. Browse restaurants and find
          something delicious!
        </p>
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
        >
          Browse Restaurants <ChevronRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Checkout
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            {cart.restaurantName} &bull; {cart.getTotalItems()} items
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column - Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Delivery Address
              </h2>
              <Link
                href="/addresses"
                className="text-red-600 font-semibold text-sm hover:text-red-700"
              >
                Manage Addresses
              </Link>
            </div>

            {addressesLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-2xl animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-48" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : savedAddresses.length > 0 ? (
              <div className="space-y-3">
                {savedAddresses.map((addr) => {
                  const isSelected = addr.id === selectedAddressId;
                  const AddrIcon = getAddressIcon(addr.label);

                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`w-full flex gap-4 p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${isSelected
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full mix-blend-multiply opacity-50" />
                      )}
                      <div className={`w-10 h-10 rounded-full flex justify-center items-center shrink-0 ${isSelected ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                        }`}>
                        <AddrIcon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{addr.label}</h3>
                          {addr.isDefault && (
                            <span className="bg-gray-200 text-gray-600 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed truncate">
                          {addr.address}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {addr.city}{addr.country ? `, ${addr.country}` : ""}
                        </p>
                      </div>
                      {/* Selection indicator */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${isSelected ? "border-red-500 bg-red-500" : "border-gray-300"
                        }`}>
                        {isSelected && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                    </button>
                  );
                })}

                {/* Add new address link */}
                <Link
                  href="/addresses"
                  className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50/50 transition-all font-semibold text-sm"
                >
                  <Plus size={16} /> Add New Address
                </Link>
              </div>
            ) : deliveryAddress ? (
              <div className="flex gap-4 p-4 border-2 border-red-500 rounded-2xl bg-red-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full mix-blend-multiply opacity-50" />
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex justify-center items-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">Delivery Address</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {deliveryAddress}
                  </p>
                  {user?.phone && (
                    <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
                      Phone:{" "}
                      <span className="font-medium text-gray-700">
                        {user.phone}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-4 p-4 border-2 border-dashed border-amber-400 rounded-2xl bg-amber-50">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex justify-center items-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    No address set
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Please{" "}
                    <Link
                      href="/addresses"
                      className="text-red-600 font-semibold underline"
                    >
                      add a delivery address
                    </Link>{" "}
                    to proceed with your order.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Time */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Delivery Time
            </h2>
            <div className="flex gap-4">
              <div className="border-2 border-red-500 bg-red-50 rounded-2xl p-4 cursor-pointer relative flex-1">
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border-2 border-white" />
                <Clock className="text-red-500 mb-2" size={24} />
                <h3 className="font-bold text-gray-900">Standard</h3>
                <p className="text-sm text-gray-600">30-45 mins</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Payment Method
            </h2>

            <div className="space-y-3">
              {/* COD Option */}
              <button
                type="button"
                onClick={() => { setPaymentMethod("cod"); setClientSecret(null); setPendingOrderId(null); }}
                className={`w-full flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-8 rounded-lg flex justify-center items-center text-white ${
                    paymentMethod === "cod" ? "bg-green-600" : "bg-gray-400"
                  }`}>
                    <Banknote size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">
                      Cash on Delivery
                    </p>
                    <p className="text-xs text-gray-500">
                      Pay when you receive your order
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-4 ${
                  paymentMethod === "cod" ? "border-green-500" : "border-gray-300"
                } bg-white`} />
              </button>

              {/* Card Option — only show when Stripe is enabled */}
              {stripeEnabled && (
                <button
                  type="button"
                  onClick={() => { setPaymentMethod("card"); setClientSecret(null); setPendingOrderId(null); }}
                  className={`w-full flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-8 rounded-lg flex justify-center items-center text-white ${
                      paymentMethod === "card" ? "bg-indigo-600" : "bg-gray-400"
                    }`}>
                      <CreditCard size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900">
                        Pay with Card
                      </p>
                      <p className="text-xs text-gray-500">
                        Credit or debit card via Stripe
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-4 ${
                    paymentMethod === "card" ? "border-indigo-500" : "border-gray-300"
                  } bg-white`} />
                </button>
              )}

              {!stripeEnabled && (
                <p className="text-center text-sm text-gray-400 font-medium py-2">
                  More payment methods coming soon
                </p>
              )}
            </div>
          </div>

          {/* Order Notes */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Notes{" "}
              <span className="text-sm font-normal text-gray-400">
                (Optional)
              </span>
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for your order..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors resize-none h-24"
            />
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
            <div className="p-6 bg-gray-50/50 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Order Summary
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                From {cart.restaurantName}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Items */}
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.menuItemId} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden relative shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 leading-tight line-clamp-1">
                          {item.name}
                        </h4>
                        <span className="font-bold text-gray-900 ml-2 whitespace-nowrap">
                          ৳{(item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        ৳{item.price.toFixed(0)} each
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              cart.updateQuantity(
                                item.menuItemId,
                                item.quantity - 1
                              )
                            }
                            className="w-7 h-7 rounded-full border border-gray-200 flex justify-center items-center text-gray-600 hover:bg-gray-50"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-bold text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              cart.updateQuantity(
                                item.menuItemId,
                                item.quantity + 1
                              )
                            }
                            className="w-7 h-7 rounded-full border border-gray-200 flex justify-center items-center text-gray-600 hover:bg-gray-50"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => cart.removeItem(item.menuItemId)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="pt-5 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-red-500" />
                  Promo Code
                </h3>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-green-600" />
                      </div>
                      <div>
                        <span className="font-bold text-green-800 text-sm tracking-wider">
                          {appliedCoupon.code}
                        </span>
                        <p className="text-xs text-green-600">
                          {appliedCoupon.type === "percentage"
                            ? `${appliedCoupon.discountValue}% off`
                            : `৳${appliedCoupon.discountValue} off`}
                          {" · "}
                          Saving ৳{appliedCoupon.discount.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="p-1 hover:bg-green-100 rounded-full transition-colors"
                    >
                      <X size={16} className="text-green-700" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          if (couponError) setCouponError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        placeholder="Enter promo code"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors placeholder:normal-case placeholder:tracking-normal"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {couponLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-xs mt-2 font-medium">
                        {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="pt-6 border-t border-gray-100 space-y-3 relative">
                {pricingLoading && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                    <Loader2 className="animate-spin text-red-500" size={20} />
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ৳{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-gray-900">
                    ৳{deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-medium text-gray-900">
                    ৳{tax.toFixed(2)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      Discount
                    </span>
                    <span className="font-medium">-৳{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900 p-6 text-white">
              <div className="flex justify-between items-center mb-6">
                <span className="font-medium text-gray-300">Total to pay</span>
                <span className="font-extrabold text-2xl">
                  ৳{total.toFixed(2)}
                </span>
              </div>

              {/* Stripe Payment Form — shown after order is created with card payment */}
              {clientSecret && stripePromise && paymentMethod === "card" ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#4f46e5",
                        borderRadius: "12px",
                      },
                    },
                  }}
                >
                  <StripeCheckoutForm
                    onSuccess={handleStripeSuccess}
                    onError={handleStripeError}
                    total={total}
                  />
                </Elements>
              ) : (
                <>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || !deliveryAddress || pricingLoading}
                    className={`w-full py-4 ${
                      paymentMethod === "card"
                        ? "bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 hover:shadow-indigo-600/40"
                        : "bg-red-600 hover:bg-red-700 disabled:bg-red-400 hover:shadow-red-600/40"
                    } disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg flex justify-center items-center gap-2 text-lg`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        {paymentMethod === "card" ? "Processing..." : "Placing Order..."}
                      </>
                    ) : (
                      <>
                        {paymentMethod === "card" ? (
                          <><CreditCard size={20} /> Pay with Card</>
                        ) : (
                          <><CheckCircle2 size={20} /> Place Order (COD)</>
                        )}
                      </>
                    )}
                  </button>
                  <p className="text-center text-gray-400 text-xs mt-3">
                    {paymentMethod === "card" ? (
                      <>You will be prompted to enter your card details</>  
                    ) : (
                      <>
                        You will pay ৳{total.toFixed(2)} when your order is delivered
                        {discount > 0 && (
                          <span className="block text-green-400 mt-1">
                            You&apos;re saving ৳{discount.toFixed(0)} with code {appliedCoupon?.code}!
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
