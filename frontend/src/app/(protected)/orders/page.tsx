"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Calendar,
  ChevronRight,
  Eye,
  Loader2,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { privateInstance } from "@/configs/axiosConfig";

interface Order {
  id: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: string;
  subtotal: string;
  deliveryFee: string;
  tax: string;
  createdAt: string;
  estimatedDeliveryTime: string | null;
  restaurantId: number;
  restaurantName: string | null;
  restaurantLogo: string | null;
  restaurantSlug: string | null;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-700",
    icon: CheckCircle2,
  },
  preparing: {
    label: "Preparing",
    color: "bg-orange-100 text-orange-700",
    icon: UtensilsCrossed,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "bg-purple-100 text-purple-700",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 86400000;

  if (diff < oneDay && date.getDate() === now.getDate()) {
    return `Today, ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }

  const yesterday = new Date(now.getTime() - oneDay);
  if (date.getDate() === yesterday.getDate()) {
    return `Yesterday, ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "past">("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await privateInstance.get("/order");
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "active") {
      return !["delivered", "cancelled"].includes(order.status);
    }
    if (activeTab === "past") {
      return ["delivered", "cancelled"].includes(order.status);
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Your Orders
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          View and track your previous and current orders.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
        {(
          [
            { key: "all", label: "All Orders" },
            { key: "active", label: "Active" },
            { key: "past", label: "Past Orders" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 border-b-2 font-bold whitespace-nowrap px-2 transition-colors ${
              activeTab === tab.key
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-medium">Loading your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={32} />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">No orders yet</p>
          <p className="text-gray-500 mb-6 max-w-sm text-center">
            {activeTab === "active"
              ? "You don't have any active orders right now."
              : "Start ordering from your favorite restaurants!"}
          </p>
          <Link
            href="/restaurants"
            className="bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
          >
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  {/* Restaurant Logo */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden relative border border-gray-100 bg-gray-50 flex items-center justify-center">
                    {order.restaurantLogo ? (
                      <img
                        src={order.restaurantLogo}
                        alt={order.restaurantName || "Restaurant"}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <UtensilsCrossed className="text-gray-400" size={24} />
                    )}
                  </div>

                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between mb-1 sm:items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">
                        {order.restaurantName || "Unknown Restaurant"}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit ${status.color}`}
                      >
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </div>

                    <p className="text-gray-500 text-sm mb-3">
                      Order #{order.id}
                    </p>

                    <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Package size={14} className="text-gray-400" />
                        COD
                      </div>
                      <div className="flex items-center font-bold text-gray-900 ml-auto sm:ml-0">
                        ৳{parseFloat(order.total).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    size={20}
                    className="text-gray-300 group-hover:text-red-500 transition-colors hidden sm:block"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
