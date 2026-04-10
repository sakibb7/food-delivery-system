import Image from "next/image";
import { Star, Clock } from "lucide-react";
import { Restaurant } from "@/hooks/useRestaurants";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  return (
    <div className="group rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 bg-white hover:-translate-y-1 cursor-pointer flex flex-col h-full">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={restaurant.img}
          alt={restaurant.name}
          width={400}
          height={224}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
          Promoted
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center text-gray-800 shadow-sm hover:text-red-500 transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-md text-sm font-bold shadow-sm">
            {restaurant.rating} <Star size={14} fill="currentColor" />
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-1">
          {restaurant.tags.join(", ")}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600 font-medium">
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-gray-400" />
            {restaurant.time}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400 font-normal">Approx.</span>
            {restaurant.price}
          </div>
        </div>
      </div>
    </div>
  );
};
