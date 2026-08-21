import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/app-context";
import type { AppContextType } from "../types";

export const ProtectedRoute = () => {
  const { isAuth, isInitialized, user } = useContext(AppContext) as AppContextType;

  // Wait until the initial auth check fully completes (including any token refresh)
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <p className="text-sm text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user && (user.role === "admin" || user.role === "Admin");

  if (!isAuth || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
