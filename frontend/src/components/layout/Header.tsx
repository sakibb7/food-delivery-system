"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Heart,
  MapPin,
  Package,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { resetQueryClient } from "@/configs/query-client";
import { toast } from "sonner";
import Logo from "../ui/Logo";

interface HeaderProps {
  /**
   * "transparent" — overlay on hero images (homepage), white text
   * "solid" — white background with border (inner pages, default)
   */
  variant?: "transparent" | "solid";
}

export default function Header({ variant = "solid" }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Auth state
  const { user, isLoading, isAuthenticated, getUser, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.items).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const clearCart = useCartStore((s) => s.clearCart);

  // Fetch user on mount if not already loaded
  useEffect(() => {
    if (!isAuthenticated && !user) {
      getUser();
    }
  }, []);

  // UI state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  // Logout mutation
  const { mutate: logoutMutate } = useQueryMutation({
    url: "/auth/logout",
  });

  const signOut = () => {
    logoutMutate(
      {},
      {
        onSuccess: () => {
          setIsDropdownOpen(false);
          logout();          // Clear Zustand auth state
          resetQueryClient(); // Clear all cached query data
          clearCart();        // Clear persisted cart
          router.push("/sign-in");
          toast.success("Logged out successfully!");
        },
        onError: () => {
          // Even if server call fails, clear client state
          logout();
          resetQueryClient();
          clearCart();
          router.push("/sign-in");
          toast.error("Logged out locally. Server may still have an active session.");
        },
      },
    );
  };

  // Nav links adapt based on user role
  const navLinks = user
    ? [
      { name: "Home", href: "/" },
      { name: "Restaurants", href: "/restaurants" },
      ...(user.role === "restaurant"
        ? [{ name: "My Restaurants", href: "/dashboard/restaurants" }]
        : [{ name: "Orders", href: "/orders" }]),
      { name: "Dashboard", href: "/dashboard" },
    ]
    : [
      { name: "Home", href: "/" },
      { name: "Restaurants", href: "/restaurants" },
    ];

  // Style variants
  const isTransparent = variant === "transparent";

  const headerClasses = isTransparent
    ? "absolute top-0 w-full z-50 bg-black/20 backdrop-blur-sm text-white"
    : "sticky top-0 w-full z-50 bg-white border-b border-gray-100 shadow-sm text-gray-900";

  const linkHover = isTransparent
    ? "hover:text-red-400"
    : "hover:text-red-600";

  const activeLink = isTransparent
    ? "text-red-400"
    : "text-red-600 border-b-2 border-red-500";

  const mutedText = isTransparent ? "text-white/70" : "text-gray-500";
  const dropdownBtnClasses = isTransparent
    ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
    : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700";

  // ──────────────────────────────────────────────────────────────────────────────
  // Render: Right side content based on auth state
  // ──────────────────────────────────────────────────────────────────────────────
  const renderAuthSection = () => {
    // Loading
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={20} />
          <span className={`text-sm ${mutedText}`}>Loading...</span>
        </div>
      );
    }

    // Not authenticated
    if (!user) {
      return (
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className={`hidden sm:flex items-center gap-2 font-medium transition-colors ${linkHover}`}
          >
            <User size={20} />
            Sign in
          </Link>
          <Link
            href="/partner"
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-medium transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30"
          >
            Business
          </Link>
        </div>
      );
    }

    // Authenticated — full user controls
    return (
      <div className="flex items-center gap-4">
        {/* Cart */}
        <Link
          href="/checkout"
          className={`relative transition-colors ${linkHover}`}
        >
          <Package size={22} />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>

        {/* Favorites */}
        <Link
          href="/favorites"
          className={`hidden sm:block transition-colors ${linkHover}`}
        >
          <Heart size={20} />
        </Link>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 focus:outline-none pl-2 pr-3 py-1.5 rounded-full border transition-colors ${dropdownBtnClasses}`}
          >
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm overflow-hidden">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt="Avatar"
                  height={32}
                  width={32}
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                (user.firstName?.charAt(0) || "") +
                (user.lastName?.charAt(0) || "")
              )}
            </div>
            <span className="font-semibold text-sm hidden lg:inline">
              {user.firstName}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""} ${isTransparent ? "text-white/60" : "text-gray-400"}`}
            />
          </button>

          {/* Dropdown Menu — always rendered in solid colors for readability */}
          {isDropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none animate-in fade-in slide-in-from-top-2 z-50">
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900">
                  Signed in as
                </p>
                <p
                  className="text-sm font-bold text-gray-500 truncate"
                  title={user.email}
                >
                  {user.email}
                </p>
              </div>
              <div className="py-2">
                <Link
                  href="/profile"
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
    );
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // Render: Mobile menu
  // ──────────────────────────────────────────────────────────────────────────────
  const renderMobileMenu = () => {
    if (!isMobileMenuOpen) return null;

    return (
      <div className="md:hidden border-t border-gray-100 bg-white text-gray-900 absolute top-full left-0 right-0 shadow-lg">
        {/* Nav links */}
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === link.href
                ? "border-red-500 text-red-700 bg-red-50"
                : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* User section */}
        {user ? (
          <div className="pt-4 pb-3 border-t border-gray-100">
            <div className="flex items-center px-4">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold overflow-hidden">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt="Avatar"
                      height={40}
                      width={40}
                      className="object-cover w-full h-full rounded-full"
                    />
                  ) : (
                    (user.firstName?.charAt(0) || "") +
                    (user.lastName?.charAt(0) || "")
                  )}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-semibold text-gray-800">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                Account Settings
              </Link>
              <Link
                href="/addresses"
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                Saved Addresses
              </Link>
              <Link
                href="/favorites"
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                Favorites
              </Link>
              <Link
                href="/checkout"
                className="flex items-center gap-2 px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                Cart
                {totalItems > 0 && (
                  <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
              <button
                onClick={signOut}
                className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-gray-100 px-4 space-y-2">
            <Link
              href="/sign-in"
              className="block w-full text-center py-2.5 font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="block w-full text-center py-2.5 font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // Main render
  // ──────────────────────────────────────────────────────────────────────────────
  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            <Logo isDark={!isTransparent} />

            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-semibold transition-colors ${isActive
                      ? activeLink
                      : `${mutedText} ${linkHover}`
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side — desktop */}
          <div className="hidden md:flex items-center">
            {renderAuthSection()}
          </div>

          {/* Right side — mobile */}
          <div className="flex items-center md:hidden gap-3">
            {/* Cart badge on mobile */}
            {user && (
              <Link href="/checkout" className="relative">
                <Package size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md transition-colors ${isTransparent
                ? "text-white/80 hover:text-white hover:bg-white/10"
                : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                }`}
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
      {renderMobileMenu()}
    </header>
  );
}
