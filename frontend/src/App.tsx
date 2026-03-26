import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/protectedRoutes";
import PublicRoute from "./components/publicRoutes";
import SelectRole from "./pages/SelectRole";

export const authService = "http://localhost:5000";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/select-role" element={<SelectRole />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
