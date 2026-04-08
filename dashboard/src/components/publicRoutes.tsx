import { Navigate, Outlet } from "react-router-dom";
import { useAppData } from "../context/useAppData";

export default function PublicRoute() {
  const { isAuth, isLoading } = useAppData();

  if (isLoading) return null;

  return isAuth ? <Navigate to={"/"} replace /> : <Outlet />;
}
