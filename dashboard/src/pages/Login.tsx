import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { AppContext } from "../context/app-context";
import type { AppContextType } from "../types";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const context = useContext(AppContext) as AppContextType;

  // We conditionally use context below just to be safe if it's undefined
  const setIsAuth = context?.setIsAuth;
  const setUser = context?.setUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      // Assuming a backend endpoint for admin login exists, otherwise 
      // replace this with the appropriate authentication logic.
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_VERSION_PATH}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const user = response.data?.data?.user;

      if (!user) {
        toast.error("Failed to fetch user data.");
        return;
      }

      if (user.role !== 'admin' && user.role !== 'Admin') {
        toast.error("Access denied. Admin only.");
        return;
      }

      if (setIsAuth) setIsAuth(true);
      if (setUser) setUser(user);

      toast.success("Login successful!");
      navigate("/");
    } catch (error: any) {
      console.error("Login failed", error);
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 mt-2">Sign in to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-gray-50 focus:bg-white"
                placeholder="admin@tomato.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-gray-50 focus:bg-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign in to Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            For support, contact <a href="#" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">IT Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
