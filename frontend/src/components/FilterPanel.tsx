import { FilterType } from "@/hooks/useRestaurants";
import { Search, Star, Clock } from "lucide-react";

interface FilterPanelProps {
  filters: FilterType;
  updateFilters: (newFilters: Partial<FilterType>) => void;
  availableCuisines: string[];
}

export const FilterPanel = ({ filters, updateFilters, availableCuisines }: FilterPanelProps) => {
  const toggleCuisine = (cuisine: string) => {
    const newCuisines = filters.cuisine.includes(cuisine)
      ? filters.cuisine.filter((c) => c !== cuisine)
      : [...filters.cuisine, cuisine];
    updateFilters({ cuisine: newCuisines });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>

      {/* Search */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search restaurant..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
          />
        </div>
      </div>

      {/* Cuisine */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Cuisine</label>
        <div className="flex flex-wrap gap-2">
          {availableCuisines.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => toggleCuisine(cuisine)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filters.cuisine.includes(cuisine)
                  ? "bg-red-600 text-white shadow-md shadow-red-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3 text-start">Minimum Rating</label>
        <div className="flex items-center gap-2">
          {[3, 3.5, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => updateFilters({ minRating: rating === filters.minRating ? 0 : rating })}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-bold transition-all ${
                filters.minRating === rating
                  ? "bg-green-600 text-white shadow-md shadow-green-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {rating}+ <Star size={14} fill={filters.minRating === rating ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Time */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Max Delivery Time</label>
        <div className="space-y-3">
          {[20, 30, 45, 60].map((time) => (
            <button
              key={time}
              onClick={() => updateFilters({ maxTime: time === filters.maxTime ? null : time })}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                filters.maxTime === time
                  ? "bg-gray-900 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center gap-2">
                <Clock size={16} /> Under {time} min
              </span>
              {filters.maxTime === time && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => updateFilters({ cuisine: [], minRating: 0, maxTime: null, search: '' })}
        className="w-full py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-100 mt-4"
      >
        Clear All Filters
      </button>
    </div>
  );
};
