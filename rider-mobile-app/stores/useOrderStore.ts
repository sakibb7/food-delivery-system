import { create } from "zustand";

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

export const useOrderStore = create<OrderState>((set) => ({
  activeOrder: null,

  setActiveOrder: (order) => set({ activeOrder: order }),

  updateActiveOrderStatus: (status) =>
    set((state) => ({
      activeOrder: state.activeOrder
        ? { ...state.activeOrder, status }
        : null,
    })),

  clearActiveOrder: () => set({ activeOrder: null }),
}));
