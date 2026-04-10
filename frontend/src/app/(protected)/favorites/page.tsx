import React from "react";
import Link from "next/link";
import { Heart, Star, Clock } from "lucide-react";
import Image from "next/image";

const favoriteRestaurants = [
  {
    id: 1,
    name: "Burger King",
    tags: "Burger, Fast Food",
    rating: 4.8,
    time: "20-30 min",
    img: "/burger.png",
  },
  {
    id: 3,
    name: "Sushi Samurai",
    tags: "Sushi, Japanese",
    rating: 4.9,
    time: "40-50 min",
    img: "/sushi.png",
  },
];

export default function FavoritesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center sm:text-left">
          Favorite Restaurants
        </h1>
        <p className="text-gray-500 mt-1 font-medium text-center sm:text-left">
          Your saved places for quick access.
        </p>
      </div>

      {favoriteRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoriteRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col h-full cursor-pointer hover:-translate-y-1"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={restaurant.img}
                  alt={restaurant.name}
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  fill
                />
                <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center text-red-500 shadow-sm hover:bg-white transition-colors">
                  <Heart size={20} fill="currentColor" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm font-bold shadow-sm">
                    {restaurant.rating} <Star size={14} fill="currentColor" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-1">
                  {restaurant.tags}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-gray-400" />
                    {restaurant.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Heart size={40} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No favorites yet
          </h2>
          <p className="text-gray-500 max-w-sm mb-8">
            Save your favorite restaurants to quickly find them later.
          </p>
          <Link
            href="/"
            className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
          >
            Explore Restaurants
          </Link>
        </div>
      )}
    </div>
  );
}
