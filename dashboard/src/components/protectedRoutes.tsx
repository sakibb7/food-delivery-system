import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppData } from "../context/useAppData";

export default function ProtectedRoute() {
  const { isAuth, user, isLoading } = useAppData();
  const location = useLocation();

  console.log(isAuth, user, isLoading);

  if (isLoading) return null;

  if (!isAuth) {
    return <Navigate to={"/login"} replace />;
  }

  if (!user?.role && location.pathname !== "/select-role") {
    return <Navigate to={"/select-role"} replace />;
  }

  console.log(user?.role !== null && location.pathname !== "/select-role");

  // if (user?.role !== null && location.pathname !== "/select-role") {
  //   return <Navigate to={"/"} replace />;
  // }

  return <Outlet />;
}
