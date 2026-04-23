import { useState, useEffect, useCallback } from "react";
import type { User } from "../types";
import { AppContext } from "./app-context";
import { useGetQuery } from "../hooks/mutate/useGetQuery";
import { privateInstance } from "../configs/axiosConfig";
import { resetQueryClient } from "../configs/query-client";

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    isLoading: queryLoading,
    isSuccess,
    data: userData,
    isFetching,
    isError,
  } = useGetQuery({
    isPublic: false,
    url: "/user/me",
    queryKey: ["auth", "me"],
  });

  useEffect(() => {
    if (isSuccess && userData?.user) {
      setUser(userData.user);
      setIsInitialized(true);
    } else if (isError && !queryLoading && !isFetching) {
      // Auth check completed but failed (after interceptor refresh attempt)
      setUser(null);
      setIsInitialized(true);
    }
  }, [isSuccess, isError, userData, queryLoading, isFetching]);

  const logout = useCallback(async () => {
    try {
      await privateInstance.post("/auth/logout");
    } catch {
      // Logout endpoint may fail if tokens are already expired — that's fine
    } finally {
      setUser(null);
      setIsInitialized(false);
      resetQueryClient();
      // Small delay so state clears before redirect
      window.location.href = "/login";
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuth: !!user,
        isLoading: queryLoading || isFetching,
        isInitialized,
        setUser,
        user,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};