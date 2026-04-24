import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/app-context";
import type { AppContextType } from "../types";

interface PermissionProtectedRouteProps {
  permission: string;
}

export const PermissionProtectedRoute = ({ permission }: PermissionProtectedRouteProps) => {
  const { isAuth, isInitialized, user } = useContext(AppContext) as AppContextType;

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <p className="text-sm text-gray-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  const hasPermission = user?.adminRole?.permissions?.includes(permission);

  if (!isAuth || !hasPermission) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
