import React from 'react';
import Link from 'next/link';
import { Search, Clock, ChevronRight, Star, Heart } from 'lucide-react';
import Image from 'next/image';

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, User!</h1>
          <p className="text-gray-500 mt-1 font-medium">What are you craving today?</p>
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
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Recommended for You</h2>
          <Link href="/restaurants" className="text-red-500 hover:text-red-600 font-semibold flex items-center transition-colors">
            See all <ChevronRight size={18} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 1, name: "Burger King", desc: "American \u2022 Fast Food", rating: 4.8, time: "20-30 min", img: "/burger.png" },
            { id: 2, name: "Pizza Hut", desc: "Italian \u2022 Pizza", rating: 4.5, time: "30-45 min", img: "/pizza.png" },
            { id: 3, name: "Sushi Samurai", desc: "Japanese \u2022 Sushi", rating: 4.9, time: "40-50 min", img: "/sushi.png" },
          ].map((item) => (
            <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer block hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <Image src={item.img} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition-all">
                  <Heart size={18} />
                </button>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-sm font-bold">
                    {item.rating} <Star size={14} fill="currentColor" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-1">{item.desc}</p>
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
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Recent Orders</h2>
          <Link href="/orders" className="text-red-500 hover:text-red-600 font-semibold flex items-center transition-colors">
            View history <ChevronRight size={18} />
          </Link>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {[
            { id: "ORD-123", restaurant: "Pizza Hut", date: "Today, 1:30 PM", items: "1x Large Pepperoni, 1x Coke", total: "$24.50", status: "Delivered" },
            { id: "ORD-122", restaurant: "Burger King", date: "Yesterday, 7:45 PM", items: "2x Whopper, 2x Fries", total: "$18.00", status: "Delivered" },
          ].map((order) => (
            <div key={order.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500 font-bold text-xl">
                  {order.restaurant.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{order.restaurant}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-gray-500">{order.date}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-sm font-medium text-gray-500">{order.total}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 truncate max-w-sm">{order.items}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-semibold flex-1 sm:flex-none text-center">
                  {order.status}
                </div>
                <Link href={`/orders/${order.id}`} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex-1 sm:flex-none text-center">
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
