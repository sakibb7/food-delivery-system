import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FavoriteRestaurant {
  id: number;
  name: string;
  tags: string;
  rating: number;
  time: string;
  img: string;
}

interface FavoritesState {
  favorites: FavoriteRestaurant[];
  addFavorite: (restaurant: FavoriteRestaurant) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (restaurant: FavoriteRestaurant) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (restaurant) =>
        set((state) => ({
          favorites: [...state.favorites, restaurant],
        })),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.id !== id),
        })),
      isFavorite: (id) => get().favorites.some((fav) => fav.id === id),
      toggleFavorite: (restaurant) => {
        const isFav = get().isFavorite(restaurant.id);
        if (isFav) {
          get().removeFavorite(restaurant.id);
        } else {
          get().addFavorite(restaurant);
        }
      },
    }),
    {
      name: "favorites-storage",
    }
  )
);
