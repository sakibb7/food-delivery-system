import { useState, useEffect, useMemo } from 'react';

export interface Restaurant {
  id: string;
  name: string;
  tags: string[];
  rating: number;
  time: string;
  price: string;
  img: string;
  cuisine: string;
}

export type FilterType = {
  cuisine: string[];
  minRating: number;
  maxTime: number | null;
  search: string;
};

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterType>({
    cuisine: [],
    minRating: 0,
    maxTime: null,
    search: '',
  });

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/restaurants');
        if (!response.ok) throw new Error('Failed to fetch restaurants');
        const data = await response.json();
        setRestaurants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      // Cuisine filter
      if (filters.cuisine.length > 0 && !filters.cuisine.includes(restaurant.cuisine)) {
        return false;
      }
      
      // Rating filter
      if (restaurant.rating < filters.minRating) {
        return false;
      }

      // Time filter (extracting number from "25-30 min")
      if (filters.maxTime !== null) {
        const timeMatch = restaurant.time.match(/(\d+)-(\d+)/);
        if (timeMatch) {
          const avgTime = (parseInt(timeMatch[1]) + parseInt(timeMatch[2])) / 2;
          if (avgTime > filters.maxTime) return false;
        } else {
           const singleMatch = restaurant.time.match(/(\d+)/);
           if (singleMatch && parseInt(singleMatch[1]) > filters.maxTime) return false;
        }
      }

      // Search filter
      if (filters.search && !restaurant.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [restaurants, filters]);

  const updateFilters = (newFilters: Partial<FilterType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    restaurants: filteredRestaurants,
    allRestaurants: restaurants,
    loading,
    error,
    filters,
    updateFilters,
  };
};
