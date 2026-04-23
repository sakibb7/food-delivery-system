"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { useCurrency } from "@/hooks/useCurrency";
import { Clock, CheckCircle, ChefHat, Truck, MapPin, Package, AlertCircle } from "lucide-react";

export default function RestaurantOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const { currencySymbol } = useCurrency();

  const { data, isLoading, refetch } = useGetQuery({
    url: `/restaurant/${restaurantId}/orders`,
  });

  const { mutate, isLoading: isLoadingMutation } = useQueryMutation({
    url: `/restaurant/${restaurantId}/orders`,
    method: "PATCH",
  });

  const orders = data?.orders || [];

  const activeOrders = orders.filter((o: any) =>
    ["pending", "confirmed", "preparing", "ready_for_pickup", "out_for_delivery"].includes(o.status)
  );

  const pastOrders = orders.filter((o: any) =>
    ["delivered", "cancelled"].includes(o.status)
  );

  const handleStatusUpdate = (orderId: number, status: string) => {
    mutate({
      updatedUrl: `/restaurant/${restaurantId}/orders/${orderId}/status`,
      status
    }, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const displayedOrders = activeTab === "active" ? activeOrders : pastOrders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "preparing": return "bg-orange-100 text-orange-800 border-orange-200";
      case "ready_for_pickup": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "out_for_delivery": return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getNextStatusAction = (order: any) => {
    switch (order.status) {
      case "pending":
        return <button disabled={isLoadingMutation} onClick={() => handleStatusUpdate(order.id, "confirmed")} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">Accept Order</button>;
      case "confirmed":
        return <button disabled={isLoadingMutation} onClick={() => handleStatusUpdate(order.id, "preparing")} className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition">Start Preparing</button>;
      case "preparing":
        return <button disabled={isLoadingMutation} onClick={() => handleStatusUpdate(order.id, "ready_for_pickup")} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">Mark Ready for Pickup</button>;
      case "ready_for_pickup":
        return (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500 italic">Waiting for Rider...</span>
            <button disabled={isLoadingMutation} onClick={() => handleStatusUpdate(order.id, "out_for_delivery")} className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition">Self Delivery</button>
          </div>
        );
      case "out_for_delivery":
        return <button disabled={isLoadingMutation} onClick={() => handleStatusUpdate(order.id, "delivered")} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition">Mark Delivered</button>;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <button onClick={() => router.push("/dashboard/restaurants")} className="text-gray-500 hover:text-red-500 mb-2 text-sm font-bold flex items-center gap-2">
            &larr; Back to Restaurants
          </button>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-500 mt-2 font-medium">Process incoming orders for your restaurant.</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "active" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Active Orders ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "past" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Past Orders ({pastOrders.length})
          </button>
        </div>
      </div>

      {displayedOrders.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 p-16 text-center shadow-sm mt-8">
          <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-400">
            <Package size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No {activeTab} orders</h2>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            There are currently no {activeTab} orders for this restaurant.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {displayedOrders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-md p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(order.status)}`}>
                      {order.status.replace("_", " ")}
                    </span>
                    <span className="text-gray-400 text-sm font-medium">Order #{order.id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{order.userFirstName} {order.userLastName}</h3>
                  <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                    <Clock size={14} />
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-gray-900">{currencySymbol}{order.total}</div>
                  <div className="text-sm font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg mt-1 inline-block uppercase">
                    {order.paymentMethod}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-bold text-gray-900 mb-2">Order Items:</h4>
                <ul className="space-y-2">
                  {order.items?.map((item: any) => (
                    <li key={item.id} className="flex justify-between text-gray-600 text-sm">
                      <span className="font-medium text-gray-800">
                        <span className="text-red-500 mr-2">{item.quantity}x</span>
                        {item.name}
                      </span>
                      <span>{currencySymbol}{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-4 mt-auto">
                <div className="flex items-start gap-3 mb-3">
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-gray-900">Delivery Address</div>
                    <div className="text-sm text-gray-600 mt-0.5">{order.deliveryAddress}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900 mr-1">Phone:</span> {order.deliveryPhone}
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-3 text-sm text-gray-600 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                    <span className="font-bold text-gray-900 block mb-1">Notes:</span>
                    {order.notes}
                  </div>
                )}
              </div>

              {activeTab === "active" && (
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 gap-3">
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, "cancelled")}
                      className="px-4 py-2 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition"
                      disabled={isLoadingMutation}
                    >
                      Cancel
                    </button>
                  )}
                  {order.status !== "pending" && <div className="flex-1"></div>}
                  {getNextStatusAction(order)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
