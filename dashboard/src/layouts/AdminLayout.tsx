import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  FileText,
  Bike,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  Star,
  Shield,
} from "lucide-react";
import { useContext } from "react";
import { AppContext } from "../context/app-context";
import type { AppContextType } from "../types";

const NAVIGATION = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users, permission: "view_users" },
  { name: "Restaurants", href: "/restaurants", icon: Store, permission: "manage_restaurants" },
  { name: "Orders", href: "/orders", icon: FileText, permission: "view_orders" },
  { name: "Reviews", href: "/reviews", icon: Star, permission: "manage_restaurants" },
  { name: "Riders", href: "/riders", icon: Bike, permission: "manage_restaurants" },
  { name: "Payments", href: "/payments", icon: CreditCard, permission: "view_financials" },
  { name: "Staff & Roles", href: "/staff", icon: Shield, permission: "edit_admins" },
  { name: "Settings", href: "/settings", icon: Settings, permission: "manage_settings" },
];

export const AdminLayout = () => {
  const { user, logout } = useContext(AppContext) as AppContextType;
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const filteredNavigation = NAVIGATION.filter(item => {
    if (!item.permission) return true;
    return user?.adminRole?.permissions?.includes(item.permission);
  });

  console.log("user", user);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-xl font-bold text-orange-500">Tekina</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-orange-500" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:flex items-center ml-4 flex-1">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search orders, users..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="ml-4 flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
              <Bell className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm">
                {user?.firstName?.charAt(0) || "A"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{user?.firstName || "Admin User"}</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-50/50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Sidebar (Basic Implementation) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="text-xl font-bold text-orange-500">Tekina</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {filteredNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-base font-medium ${isActive
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      <Icon className={`mr-4 h-6 w-6 ${isActive ? "text-orange-500" : "text-gray-400"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
