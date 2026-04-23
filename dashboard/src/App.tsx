import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";

import Login from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";

import Home from "./pages/Home";
import Users from "./pages/Users";
import Restaurants from "./pages/Restaurants";
import Orders from "./pages/Orders";
import Riders from "./pages/Riders";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import Reviews from "./pages/Reviews";
import Staff from "./pages/Staff";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/users" element={<Users />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/riders" element={<Riders />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/staff" element={<Staff />} />
            </Route>
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AppProvider>
  );
}
