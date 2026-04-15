import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  restaurantId: number;
  restaurantName: string;
}

export type CartState = {
  items: CartItem[];
  restaurantId: number | null;
  restaurantName: string | null;
};

export type CartActions = {
  addItem: (item: Omit<CartItem, "quantity">) => boolean;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
};

export type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,

      addItem: (item) => {
        const state = get();

        // Enforce single-restaurant rule
        if (
          state.restaurantId !== null &&
          state.restaurantId !== item.restaurantId
        ) {
          const confirmed = window.confirm(
            `Your cart has items from ${state.restaurantName}. Do you want to clear the cart and add items from ${item.restaurantName}?`
          );
          if (!confirmed) return false;

          // Clear and add the new item
          set({
            items: [{ ...item, quantity: 1 }],
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
          });
          return true;
        }

        // Check if item already exists
        const existingIndex = state.items.findIndex(
          (i) => i.menuItemId === item.menuItemId
        );

        if (existingIndex >= 0) {
          const newItems = [...state.items];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + 1,
          };
          set({ items: newItems });
        } else {
          set({
            items: [...state.items, { ...item, quantity: 1 }],
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
          });
        }
        return true;
      },

      removeItem: (menuItemId) => {
        const newItems = get().items.filter(
          (i) => i.menuItemId !== menuItemId
        );
        if (newItems.length === 0) {
          set({ items: [], restaurantId: null, restaurantName: null });
        } else {
          set({ items: newItems });
        }
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        const newItems = get().items.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item
        );
        set({ items: newItems });
      },

      clearCart: () => {
        set({ items: [], restaurantId: null, restaurantName: null });
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "tomato-cart",
    }
  )
);
