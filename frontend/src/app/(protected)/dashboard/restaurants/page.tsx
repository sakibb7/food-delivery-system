"use client";

import React from "react";
import Link from "next/link";
import { Plus, Store, MapPin, Star, Edit2, Trash2, ExternalLink, Clock, DollarSign } from "lucide-react";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import Button from "@/components/ui/button";
import Image from "next/image";

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description: string;
  cuisine: string;
  address: string;
  city: string;
  coverImage: string;
  rating: string;
  deliveryTime: string;
  minOrderAmount: string;
  isActive: boolean;
}

export default function MyRestaurantsPage() {
  const { data, isLoading } = useGetQuery({
    url: "/restaurant/my-restaurants",
  });

  const restaurants = data?.restaurants || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Restaurants</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage and monitor your business performance.</p>
        </div>
        <Link href="/dashboard/restaurants/new">
          <Button className="rounded-2xl px-6 py-4 text-lg font-bold shadow-lg shadow-red-200 hover:shadow-xl transition-all">
            <Plus size={24} className="mr-2" />
            Add New Restaurant
          </Button>
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 p-16 text-center shadow-sm">
          <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
            <Store size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No restaurants found</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed">
            You haven't added any restaurants yet. Start your business journey by registering your first store!
          </p>
          <Link href="/dashboard/restaurants/new">
            <Button variant="outline" className="rounded-2xl px-8 border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold">
              Register Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((restaurant: Restaurant) => (
            <Link key={restaurant.id} href={`/dashboard/restaurants/${restaurant.id}`} className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col h-full border-b-4 border-b-red-500">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={restaurant.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60"}
                  alt={restaurant.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-soft backdrop-blur-md ${restaurant.isActive ? "bg-green-500/90 text-white" : "bg-yellow-500/90 text-white"}`}>
                    {restaurant.isActive ? "Active" : "Pending Approval"}
                  </div>
                </div>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg cursor-pointer hover:bg-white transition-colors inline-flex">
                    <ExternalLink size={18} className="text-gray-700" />
                  </span>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-red-500 font-bold text-sm mt-1">{restaurant.cuisine}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-gray-900">{restaurant.rating || "0.0"}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                      <MapPin size={16} />
                    </div>
                    <span className="text-sm font-medium line-clamp-1">{restaurant.address}, {restaurant.city}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock size={16} className="text-red-400" />
                      <span className="text-sm font-medium">{restaurant.deliveryTime || "25-30"} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <DollarSign size={16} className="text-green-500" />
                      <span className="text-sm font-medium">Min ${restaurant.minOrderAmount || "0"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-3 gap-2 pt-6 border-t border-gray-100">
                  <Link href={`/dashboard/restaurants/${restaurant.id}/orders`} onClick={(e) => e.stopPropagation()} className="inline-flex flex-col items-center justify-center gap-1 rounded-xl font-bold border-2 border-green-100 hover:border-green-200 hover:bg-green-50 text-green-600 transition-all p-2 text-sm text-center">
                    <Clock size={16} />
                    Orders
                  </Link>
                  <span className="inline-flex flex-col items-center justify-center gap-1 rounded-xl font-bold border-2 border-gray-100 hover:border-red-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all p-2 text-sm text-center">
                    <Edit2 size={16} />
                    Manage
                  </span>
                  <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="inline-flex flex-col items-center justify-center gap-1 rounded-xl font-bold border-2 border-gray-100 hover:border-red-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all p-2 text-sm cursor-pointer text-center">
                    <Trash2 size={16} />
                    Delete
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
