import React from "react";
import Link from "next/link";
import { Package, Clock, Calendar, ChevronRight, Eye } from "lucide-react";
import Image from "next/image";

const mockOrders = [
  {
    id: "ORD-8739",
    restaurant: "Pizza Hut",
    date: "Today, 1:30 PM",
    items: "1x Large Math, 1x Coke",
    total: "$24.50",
    status: "Delivered",
    img: "/pizza.png",
    type: "Delivery",
  },
  {
    id: "ORD-8738",
    restaurant: "Burger King",
    date: "Yesterday, 7:45 PM",
    items: "2x Whopper, 2x Fries",
    total: "$18.00",
    status: "Delivered",
    img: "/burger.png",
    type: "Delivery",
  },
  {
    id: "ORD-8737",
    restaurant: "Sushi Samurai",
    date: "Oct 12, 8:15 PM",
    items: "1x Dragon Roll, 1x Miso Soup",
    total: "$32.00",
    status: "Cancelled",
    img: "/sushi.png",
    type: "Pickup",
  },
];

export default function OrdersPage() {
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
        <button className="pb-3 border-b-2 border-red-500 text-red-600 font-bold whitespace-nowrap px-2">
          Past Orders
        </button>
        <button className="pb-3 border-b-2 border-transparent text-gray-500 font-semibold hover:text-gray-700 whitespace-nowrap px-2">
          Upcoming
        </button>
      </div>

      <div className="space-y-6">
        {mockOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row sm:items-center gap-6"
          >
            <div className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden relative border border-gray-100">
              <Image
                src={order.img}
                alt={order.restaurant}
                className="object-cover"
                fill
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row justify-between mb-1 sm:items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {order.restaurant}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${order.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {order.status}
                </span>
              </div>

              <p className="text-gray-500 text-sm mb-3">Order #{order.id}</p>

              <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm font-medium text-gray-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-gray-400" />
                  {order.date}
                </div>
                <div className="flex items-center gap-1.5">
                  <Package size={16} className="text-gray-400" />
                  {order.type}
                </div>
                <div className="flex items-center font-bold text-gray-900 ml-auto sm:ml-0">
                  {order.total}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/orders/${order.id}`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold rounded-xl transition-colors text-sm"
                >
                  <Eye size={16} /> View Details
                </Link>
                {order.status === "Delivered" && (
                  <button className="flex-1 sm:flex-none px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-red-200 text-sm">
                    Reorder
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
