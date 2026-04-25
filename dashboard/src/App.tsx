import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";

import Login from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PermissionProtectedRoute } from "./components/PermissionProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";

import Home from "./pages/Home";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import Restaurants from "./pages/Restaurants";
import RestaurantDetails from "./pages/RestaurantDetails";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Riders from "./pages/Riders";
import RiderDetails from "./pages/RiderDetails";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import Reviews from "./pages/Reviews";
import Staff from "./pages/Staff";
import Support from "./pages/Support";
import Coupons from "./pages/Coupons";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Home />} />

              <Route element={<PermissionProtectedRoute permission="view_users" />}>
                <Route path="/users" element={<Users />} />
                <Route path="/users/:id" element={<UserDetails />} />
              </Route>

              <Route element={<PermissionProtectedRoute permission="manage_restaurants" />}>
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/restaurants/:id" element={<RestaurantDetails />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/riders" element={<Riders />} />
                <Route path="/riders/:id" element={<RiderDetails />} />
              </Route>

              <Route element={<PermissionProtectedRoute permission="view_orders" />}>
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetails />} />
              </Route>

              <Route element={<PermissionProtectedRoute permission="view_financials" />}>
                <Route path="/payments" element={<Payments />} />
              </Route>

              <Route element={<PermissionProtectedRoute permission="edit_admins" />}>
                <Route path="/staff" element={<Staff />} />
              </Route>

              <Route element={<PermissionProtectedRoute permission="manage_settings" />}>
                <Route path="/settings" element={<Settings />} />
                <Route path="/coupons" element={<Coupons />} />
              </Route>
              
              <Route element={<PermissionProtectedRoute permission="manage_support" />}>
                <Route path="/support" element={<Support />} />
              </Route>
            </Route>
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AppProvider>
  );
}
