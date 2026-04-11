import { privateInstance } from "@/configs/axiosConfig";
import { UserType } from "@/types";
import { create } from "zustand";

export type AuthState = {
  isAuthenticated: boolean;
  user: UserType | null;
  isLoading: boolean;
};

export type AuthActions = {
  login: (user: UserType) => void;
  logout: () => Promise<void>;
  getUser: () => Promise<UserType | undefined>;
};

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  login: (user) => {
    set({
      isAuthenticated: true,
      user,
    });
  },

  logout: async () => {
    try {
      await privateInstance.post("/auth/logout");
    } catch (error) {
      console.warn(error);
    } finally {
      set({
        isAuthenticated: false,
        user: null,
      });
    }
  },

  getUser: async () => {
    try {
      set({ isLoading: true });

      const res = await privateInstance.get("/auth/me");
      const user: UserType = res.data?.data;

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return user;
    } catch (error) {
      console.log(error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
