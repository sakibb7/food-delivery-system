"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Receipt,
  Phone,
  Loader2,
  XCircle,
  UtensilsCrossed,
  Banknote,
  AlertCircle,
} from "lucide-react";
import { privateInstance } from "@/configs/axiosConfig";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  name: string;
  price: string;
  quantity: number;
  createdAt: string;
}

interface OrderDetail {
  id: number;
  userId: number;
  restaurantId: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  deliveryPhone: string;
  subtotal: string;
  deliveryFee: string;
  tax: string;
  total: string;
  notes: string | null;
  estimatedDeliveryTime: string | null;
  createdAt: string;
  updatedAt: string;
  restaurantName: string | null;
  restaurantLogo: string | null;
  restaurantSlug: string | null;
  restaurantPhone: string | null;
  items: OrderItem[];
}

const statusSteps = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Order Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

function getStepStatus(
  stepKey: string,
  orderStatus: string
): "completed" | "current" | "upcoming" {
  const stepIndex = statusSteps.findIndex((s) => s.key === stepKey);
  const currentIndex = statusSteps.findIndex((s) => s.key === orderStatus);

  if (currentIndex === -1) return "upcoming";
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await privateInstance.get(`/order/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!order) return;
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (!confirmed) return;

    setCancelling(true);
    try {
      await privateInstance.patch(`/order/${order.id}/cancel`);
      setOrder({ ...order, status: "cancelled" });
      toast.success("Order cancelled successfully");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to cancel order";
      toast.error(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-red-500"
            size={48}
          />
          <p className="text-gray-500 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-2">
            Order not found
          </p>
          <Link
            href="/orders"
            className="text-red-600 font-semibold hover:underline"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";

  const getStatusBadge = () => {
    if (isCancelled) return { color: "bg-red-100 text-red-700", label: "Cancelled" };
    if (order.status === "delivered") return { color: "bg-green-100 text-green-700", label: "Delivered" };
    const step = statusSteps.find((s) => s.key === order.status);
    return { color: "bg-blue-100 text-blue-700", label: step?.label || order.status };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Order #{order.id}
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`ml-auto px-4 py-1.5 rounded-full text-sm font-bold ${statusBadge.color}`}
        >
          {statusBadge.label}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Status Tracker */}
          {!isCancelled ? (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Order Status
              </h2>
              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />

                {statusSteps.map((step, index) => {
                  const stepStatus = getStepStatus(step.key, order.status);

                  return (
                    <div
                      key={step.key}
                      className={`relative flex items-start gap-4 ${
                        index < statusSteps.length - 1 ? "mb-8" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          stepStatus === "completed"
                            ? "bg-green-500 text-white shadow-sm shadow-green-200"
                            : stepStatus === "current"
                              ? "bg-blue-500 text-white shadow-sm shadow-blue-200 animate-pulse"
                              : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {stepStatus === "completed" ? (
                          <CheckCircle2 size={16} />
                        ) : stepStatus === "current" ? (
                          <Clock size={16} />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>
                      <div>
                        <h3
                          className={`font-bold ${
                            stepStatus === "upcoming"
                              ? "text-gray-400"
                              : stepStatus === "current"
                                ? "text-blue-600"
                                : "text-gray-900"
                          }`}
                        >
                          {step.label}
                        </h3>
                        {stepStatus === "current" && (
                          <p className="text-sm text-blue-500">In progress</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
              <div className="flex items-center gap-3 text-red-700">
                <XCircle size={24} />
                <div>
                  <h2 className="text-lg font-bold">Order Cancelled</h2>
                  <p className="text-sm text-red-600">
                    This order has been cancelled.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Receipt size={20} className="text-gray-400" /> Items Summary
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="py-4 flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-600 text-sm">
                      {item.quantity}x
                    </div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-red-500 transition-colors">
                      {item.name}
                    </h4>
                  </div>
                  <span className="font-bold text-gray-900">
                    ৳{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-6 mt-2 border-t border-dashed border-gray-200">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Subtotal</span>
                <span className="font-medium">
                  ৳{parseFloat(order.subtotal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Delivery Fee</span>
                <span className="font-medium">
                  ৳{parseFloat(order.deliveryFee).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Tax</span>
                <span className="font-medium">
                  ৳{parseFloat(order.tax).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-2xl text-red-600">
                  ৳{parseFloat(order.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle size={20} className="text-gray-400" /> Order Notes
              </h2>
              <p className="text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Restaurant Info */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Restaurant
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                {order.restaurantLogo ? (
                  <img
                    src={order.restaurantLogo}
                    alt={order.restaurantName || "Restaurant"}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <UtensilsCrossed className="text-gray-400" size={20} />
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 line-clamp-1">
                  {order.restaurantName || "Unknown Restaurant"}
                </h4>
              </div>
            </div>
            <Link
              href={`/restaurants/${order.restaurantId}`}
              className="w-full block text-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold rounded-xl transition-colors text-sm"
            >
              View Menu
            </Link>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Delivery
            </h3>
            <div className="flex gap-4 mb-4">
              <MapPin
                size={20}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Delivery Address
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {order.deliveryAddress}
                </p>
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              <Phone
                size={20}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                <p className="text-sm text-gray-500">{order.deliveryPhone}</p>
              </div>
            </div>
            {order.estimatedDeliveryTime && (
              <div className="flex gap-4">
                <Clock
                  size={20}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Est. Delivery
                  </h4>
                  <p className="text-sm text-gray-500">
                    {order.estimatedDeliveryTime}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Payment
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                <Banknote size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Cash on Delivery
                </h4>
                <p className="text-xs text-gray-500 capitalize">
                  {order.paymentStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          {order.status === "pending" && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full py-3 border-2 border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {cancelling ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle size={16} />
                  Cancel Order
                </>
              )}
            </button>
          )}

          {/* Reorder Button */}
          {order.status === "delivered" && (
            <Link
              href={`/restaurants/${order.restaurantId}`}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/30 text-center block"
            >
              Order Again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
