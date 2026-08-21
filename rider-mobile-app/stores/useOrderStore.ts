import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storage } from "@/configs/storage";

interface OrderItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
}

interface ActiveOrder {
  id: number;
  status: string;
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryLat?: string;
  deliveryLng?: string;
  subtotal: string;
  deliveryFee: string;
  tax: string;
  total: string;
  notes?: string;
  estimatedDeliveryTime?: string;
  riderEarnings: string;
  restaurantId: number;
  restaurantName: string;
  restaurantLogo?: string;
  restaurantLat?: string;
  restaurantLng?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  items?: OrderItem[];
}

interface OrderState {
  activeOrder: ActiveOrder | null;
  setActiveOrder: (order: ActiveOrder) => void;
  updateActiveOrderStatus: (status: string) => void;
  clearActiveOrder: () => void;
}

const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: any) => {
    storage.set(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    storage.clearAll();
  },
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      activeOrder: null,

      setActiveOrder: (order) => set({ activeOrder: order }),

      updateActiveOrderStatus: (status) =>
        set((state) => ({
          activeOrder: state.activeOrder ? { ...state.activeOrder, status } : null,
        })),

      clearActiveOrder: () => set({ activeOrder: null }),
    }),
    {
      name: "active-order-storage",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
