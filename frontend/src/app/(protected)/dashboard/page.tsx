"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/auth";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Search,
  Clock,
  ChevronRight,
  Star,
  Heart,
  Plus,
  Store,
  TrendingUp,
  Users,
  DollarSign
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuthStore();

  const isOwner = user?.role === "restaurant";

  const { data: analytics, isLoading } = useGetQuery({
    url: "/restaurant/my-restaurants/analytics",
    enabled: isOwner,
  });

  const { currencySymbol } = useCurrency();

  if (isOwner) {
    if (isLoading) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full font-sans flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      );
    }

    const stats = analytics?.stats || { totalRestaurants: 0, todaysOrders: 0, totalRevenue: 0, totalCustomers: 0 };
    const activeRestaurants = analytics?.activeRestaurants || [];
    const recentActivity = analytics?.recentActivity || [];

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Business Overview
            </h1>
            <p className="text-gray-500 mt-2 text-lg font-medium">
              Manage your restaurants and track your performance.
            </p>
          </div>
          <Link
            href="/dashboard/restaurants/new"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} />
            Add Restaurant
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Restaurants", value: stats.totalRestaurants.toString(), icon: Store, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Today's Orders", value: stats.todaysOrders.toString(), icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Total Revenue", value: `${currencySymbol}${Number(stats.totalRevenue).toFixed(2)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
            { label: "Total Customers", value: stats.totalCustomers.toString(), icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon size={24} />
              </div>
              <p className="text-gray-500 font-semibold text-sm mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Quick Links / My Restaurants Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Active Restaurants</h2>
              <Link href="/dashboard/restaurants" className="text-red-600 font-bold hover:underline text-sm">View all</Link>
            </div>

            <div className="space-y-4">
              {activeRestaurants.length === 0 ? (
                <div className="bg-white p-5 rounded-3xl border border-gray-100 text-center text-gray-500 font-medium">
                  No restaurants found. Add one to get started!
                </div>
              ) : activeRestaurants.map((res: any, i: number) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-red-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-red-600 font-bold text-xl border border-gray-100">
                      {res.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">{res.name}</h4>
                      <p className="text-sm text-gray-500 font-medium">{res.ordersToday} orders today</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div className="hidden sm:block">
                      <p className="text-sm font-semibold text-gray-400">Revenue</p>
                      <p className="font-bold text-gray-900">{currencySymbol}{Number(res.revenue).toFixed(2)}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${res.status === 'Open' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                      {res.status}
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-red-500 transition-colors" size={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Recent Activity</h2>
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className="space-y-6">
                {recentActivity.length === 0 ? (
                   <div className="text-center text-gray-500 font-medium text-sm py-4">
                     No recent activity found.
                   </div>
                ) : recentActivity.map((activity: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-sm text-gray-900">{activity.title}</h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{activity.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">{activity.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm transition-colors">
                View All Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Customer Dashboard (Current functionality)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {user?.firstName || "User"}!
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            What are you craving today?
          </p>
        </div>

        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow shadow-sm sm:text-sm"
            placeholder="Search for restaurants, cuisines..."
          />
        </div>
      </div>

      {/* Recommended Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Recommended for You
          </h2>
          <Link
            href="/restaurants"
            className="text-red-500 hover:text-red-600 font-semibold flex items-center transition-colors"
          >
            See all <ChevronRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: 1,
              name: "Burger King",
              desc: "American \u2022 Fast Food",
              rating: 4.8,
              time: "20-30 min",
              img: "/burger.png",
            },
            {
              id: 2,
              name: "Pizza Hut",
              desc: "Italian \u2022 Pizza",
              rating: 4.5,
              time: "30-45 min",
              img: "/pizza.png",
            },
            {
              id: 3,
              name: "Sushi Samurai",
              desc: "Japanese \u2022 Sushi",
              rating: 4.9,
              time: "40-50 min",
              img: "/sushi.png",
            },
          ].map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer block hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.img}
                  alt={item.name}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  width={200}
                  height={200}
                />
                <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition-all">
                  <Heart size={18} />
                </button>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-sm font-bold">
                    {item.rating} <Star size={14} fill="currentColor" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-1">
                  {item.desc}
                </p>
                <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-50 w-fit px-3 py-1.5 rounded-lg">
                  <Clock size={14} className="mr-1.5 text-gray-400" />
                  {item.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Orders Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Recent Orders
          </h2>
          <Link
            href="/orders"
            className="text-red-500 hover:text-red-600 font-semibold flex items-center transition-colors"
          >
            View history <ChevronRight size={18} />
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {[
            {
              id: "ORD-123",
              restaurant: "Pizza Hut",
              date: "Today, 1:30 PM",
              items: "1x Large Pepperoni, 1x Coke",
              total: `${currencySymbol}24.50`,
              status: "Delivered",
            },
            {
              id: "ORD-122",
              restaurant: "Burger King",
              date: "Yesterday, 7:45 PM",
              items: "2x Whopper, 2x Fries",
              total: `${currencySymbol}18.00`,
              status: "Delivered",
            },
          ].map((order) => (
            <div
              key={order.id}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500 font-bold text-xl">
                  {order.restaurant.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {order.restaurant}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-gray-500">
                      {order.date}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-sm font-medium text-gray-500">
                      {order.total}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 truncate max-w-sm">
                    {order.items}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-semibold flex-1 sm:flex-none text-center">
                  {order.status}
                </div>
                <Link
                  href={`/orders/${order.id}`}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex-1 sm:flex-none text-center"
                >
                  Reorder
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
