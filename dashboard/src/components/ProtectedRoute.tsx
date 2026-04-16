import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/app-context";
import type { AppContextType } from "../types";

export const ProtectedRoute = () => {
  const { isAuth, isLoading, user } = useContext(AppContext) as AppContextType;

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  // Assuming `user.role` exists for admin check.
  // If `role` is not defined yet, we'll just check `isAuth` for now.
  const isAdmin = user && (user.role === 'admin' || user.role === 'Admin');

  if (!isAuth || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
