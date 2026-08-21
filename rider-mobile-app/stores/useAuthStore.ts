import { create } from "zustand";
import { storage } from "@/configs/storage";
import { TOKEN_NAME } from "@/configs";
import { resetQueryClient } from "@/configs/query-client";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: string;
}

interface RiderProfile {
  userId: number;
  vehicleType: string;
  vehicleMakeModel: string;
  vehicleRegistration?: string;
  drivingLicenseUrl?: string;
  vehicleRegistrationUrl?: string;
  isOnline: boolean;
  currentLat?: string;
  currentLng?: string;
  approvalStatus: "pending" | "approved" | "rejected";
}

interface AuthState {
  user: User | null;
  riderProfile: RiderProfile | null;
  isLoggedIn: boolean;

  setUser: (user: User) => void;
  setRiderProfile: (profile: RiderProfile | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateOnlineStatus: (isOnline: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  riderProfile: null,
  isLoggedIn: !!storage.getString(TOKEN_NAME),

  setUser: (user) => set({ user }),

  setRiderProfile: (profile) => set({ riderProfile: profile }),

  login: (user, token) => {
    storage.set(TOKEN_NAME, token);
    set({ user, isLoggedIn: true });
  },

  logout: () => {
    storage.remove(TOKEN_NAME);
    resetQueryClient();
    set({ user: null, riderProfile: null, isLoggedIn: false });
  },

  updateOnlineStatus: (isOnline) =>
    set((state) => ({
      riderProfile: state.riderProfile
        ? { ...state.riderProfile, isOnline }
        : null,
    })),
}));
