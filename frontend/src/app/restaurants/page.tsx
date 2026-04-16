"use client";

import { useRestaurants } from "@/hooks/useRestaurants";
import { RestaurantCard } from "@/components/RestaurantCard";
import { FilterPanel } from "@/components/FilterPanel";
import Link from "next/link";
import { User, Menu, MapPin, Loader2, Search } from "lucide-react";
import { useMemo } from "react";
import Logo from "@/components/ui/Logo";
import { useAppData } from "@/context/useAppData";

export default function RestaurantsPage() {
  const { location } = useAppData()
  const { restaurants, allRestaurants, loading, error, filters, updateFilters } = useRestaurants();

  const availableCuisines = useMemo(() => {
    const cuisines = new Set<string>();
    allRestaurants.forEach((r) => cuisines.add(r.cuisine));
    return Array.from(cuisines);
  }, [allRestaurants]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar (Internal specific) */}
      <nav className="sticky top-0 w-full z-50 flex items-center justify-between px-6 py-4 lg:px-12 bg-white border-b border-gray-100 shadow-sm transition-all text-gray-900">
        <Logo isDark={true} />


        {/* Location Picker (Simulated) */}
        <div className="hidden md:flex items-center gap-2 max-w-150 overflow-hidden bg-gray-50 px-4 py-2 rounded-full border border-gray-100 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-all">
          <MapPin size={16} className="text-red-500" />
          <span className="truncate">{location?.formattedAddress}</span>
          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
          <span className="text-gray-400">Change</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="hidden sm:flex items-center gap-2 font-medium hover:text-red-600 transition-colors">
            <User size={20} />
            Log in
          </Link>
          <Link href="/sign-up" className="md:hidden">
            <Menu size={24} />
          </Link>
        </div>
      </nav>

      <main className="flex-1 py-12 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar - Desktop */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <FilterPanel
              filters={filters}
              updateFilters={updateFilters}
              availableCuisines={availableCuisines}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Best Food in Dhaka
                </h1>
                <p className="text-gray-500 mt-1">
                  {restaurants.length} {restaurants.length === 1 ? 'restaurant' : 'restaurants'} found
                </p>
              </div>
            </div>

            {loading ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="font-medium">Finding the best spots for you...</p>
              </div>
            ) : error ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-red-500 bg-red-50 rounded-3xl border border-red-100 p-8">
                <p className="text-xl font-bold mb-2">Oops! Something went wrong</p>
                <p className="opacity-80">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-all"
                >
                  Retry
                </button>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Search size={32} />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">No results found</p>
                <p className="max-w-xs text-center">We couldn't find any restaurants matching your search or filters.</p>
                <button
                  onClick={() => updateFilters({ cuisine: [], minRating: 0, maxTime: null, search: '' })}
                  className="mt-6 text-red-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Internal Footer Footer (Minimal) */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 text-gray-900 p-1.5 rounded-lg font-bold text-lg">
              T
            </div>
            <span className="font-bold text-xl text-gray-900">Tomato.</span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 Tomato Food Delivery. Made with love for foodies.</p>
          <div className="flex gap-6 text-sm font-medium text-gray-500">
            <Link href="#" className="hover:text-red-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-red-600 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-red-600 transition-colors">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
