import { useState, useEffect, useMemo } from 'react';
import { publicInstance } from '@/configs/axiosConfig';


export interface Restaurant {
  id: string;
  name: string;
  tags: string[];
  rating: number;
  time: string;
  price: string;
  img: string;
  cuisine: string;
  city: string;
}

export type FilterType = {
  cuisine: string[];
  minRating: number;
  maxTime: number | null;
  search: string;
};

export interface InitialSearchParams {
  q?: string;
  city?: string;
  cuisine?: string;
}

const mapRestaurantData = (data: any[]): Restaurant[] => {
  return data.map((r: any) => ({
    id: String(r.id),
    name: r.name || 'Unknown Restaurant',
    tags: r.cuisine ? r.cuisine.split(',').map((c: string) => c.trim()) : [],
    rating: Number(r.rating) || 0,
    time: r.deliveryTime || '30-45 min',
    price: '$$',
    img: r.coverImage || r.logo,
    cuisine: r.cuisine ? r.cuisine.split(',')[0].trim() : 'General',
    city: r.city || '',
  }));
};

export const useRestaurants = (initialParams?: InitialSearchParams) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterType>({
    cuisine: initialParams?.cuisine ? [initialParams.cuisine] : [],
    minRating: 0,
    maxTime: null,
    search: initialParams?.q || '',
  });

  // Track if we're using the search API (when URL has q or city params)
  const useSearchApi = !!(initialParams?.q || initialParams?.city);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        let data: any[];

        if (useSearchApi) {
          // Use the search endpoint with params
          const params = new URLSearchParams();
          if (initialParams?.q) params.set('q', initialParams.q);
          if (initialParams?.city) params.set('city', initialParams.city);
          const response = await publicInstance.get(`/restaurant/search?${params.toString()}`);
          data = response.data?.restaurants || [];
        } else {
          // Fetch all restaurants
          const response = await publicInstance.get('/restaurant');
          data = response.data?.restaurants || [];
        }

        const mappedData = mapRestaurantData(data);
        setRestaurants(mappedData);
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [useSearchApi, initialParams?.q, initialParams?.city]);

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

      // Search filter — search across name, cuisine, and tags
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matchesName = restaurant.name.toLowerCase().includes(term);
        const matchesCuisine = restaurant.cuisine.toLowerCase().includes(term);
        const matchesTags = restaurant.tags.some(t => t.toLowerCase().includes(term));
        if (!matchesName && !matchesCuisine && !matchesTags) {
          return false;
        }
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
