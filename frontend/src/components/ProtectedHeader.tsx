"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Heart,
  MapPin,
  Package,
} from "lucide-react";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { toast } from "sonner";
import { getQueryClient } from "@/configs/query-client";
import { useAuthStore } from "@/store/auth";
import Logo from "./ui/Logo";

export default function ProtectedHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    ...(user?.role === "restaurant"
      ? [{ name: "My Restaurants", href: "/dashboard/restaurants" }]
      : [
        { name: "Orders", href: "/orders" },
        { name: "Favorites", href: "/favorites" },
      ]),
  ];

  const { mutate } = useQueryMutation({
    isPublic: true,
    url: "/auth/logout",
  });

  const signOut = () => {
    mutate(
      {},
      {
        onSuccess: () => {
          setIsDropdownOpen(false);
          getQueryClient().invalidateQueries();
          router.push("/sign-in");
          toast.success("Logout Successfully!");
        },
        onError: (data) => {
          console.log(data.error);
          toast.error("Something went wrong!");
        },
      },
    );
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Logo />

            <nav className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-colors ${pathname === link.href
                      ? "border-red-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side - Profile and Cart */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/checkout"
              className="text-gray-500 hover:text-red-500 transition-colors relative"
            >
              <Package size={22} />
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                2
              </span>
            </Link>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none bg-gray-50 hover:bg-gray-100 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 transition-colors"
              >
                {user && (
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                    {user.firstName?.charAt(0) + user.lastName?.charAt(0) ||
                      "JD"}
                  </div>
                )}
                <span className="font-semibold text-gray-700 text-sm">
                  {user?.firstName + " " + user?.lastName || "John Doe"}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      Signed in as
                    </p>
                    <p
                      className="text-sm font-bold text-gray-500 truncate"
                      title="john.doe@example.com"
                    >
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors font-medium"
                    >
                      <User
                        size={16}
                        className="mr-3 text-gray-400 group-hover:text-red-500"
                      />
                      Account Settings
                    </Link>
                    <Link
                      href="/addresses"
                      onClick={() => setIsDropdownOpen(false)}
                      className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors font-medium"
                    >
                      <MapPin
                        size={16}
                        className="mr-3 text-gray-400 group-hover:text-red-500"
                      />
                      Saved Addresses
                    </Link>
                    <Link
                      href="/favorites"
                      onClick={() => setIsDropdownOpen(false)}
                      className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors font-medium"
                    >
                      <Heart
                        size={16}
                        className="mr-3 text-gray-400 group-hover:text-red-500"
                      />
                      Favorites
                    </Link>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={signOut}
                      className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
                    >
                      <LogOut
                        size={16}
                        className="mr-3 text-gray-400 group-hover:text-red-500"
                      />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-4">
            <Link href="/checkout" className="text-gray-500 relative">
              <Package size={22} />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                2
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === link.href
                    ? "border-red-500 text-red-700 bg-red-50"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-100">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  JD
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-semibold text-gray-800">
                  John Doe
                </div>
                <div className="text-sm font-medium text-gray-500">
                  john.doe@example.com
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                Account Settings
              </Link>
              <Link
                href="/addresses"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                Saved Addresses
              </Link>
              <Link
                href="/favorites"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                Favorites
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
