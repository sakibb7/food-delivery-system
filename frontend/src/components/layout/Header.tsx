"use client";
import { useAuthStore } from "@/store/auth";
import { Menu, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import Logo from "../ui/Logo";

export default function Header() {
  const { user, getUser, isLoading } = useAuthStore();

  useEffect(() => {
    if (!user) {
      getUser();
    }
  }, [user, getUser]);

  console.log(user, "User data");

  return (
    <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-6 py-4 lg:px-12 bg-black/20 backdrop-blur-sm shadow-sm transition-all text-white">
      <Logo />
      <div className="hidden md:flex gap-8 font-medium">
        <Link href="/" className="hover:text-red-400 transition-colors">
          Home
        </Link>
        <Link href="/restaurants" className="hover:text-red-400 transition-colors">
          Restaurants
        </Link>
        <Link href="#" className="hover:text-red-400 transition-colors">
          Dining Out
        </Link>
        <Link href="#" className="hover:text-red-400 transition-colors">
          Pro
        </Link>
      </div>

      {/* ✅ LOADING STATE */}
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">Loading...</span>
        </div>
      ) : !user ? (
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="hidden sm:flex items-center gap-2 font-medium hover:text-red-400 transition-colors"
          >
            <User size={20} />
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-medium transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30"
          >
            Sign up
          </Link>
          <button className="md:hidden">
            <Menu size={24} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex font-medium">
            Hello, {user.firstName.split(" ")[0]}
          </span>
          <Link
            href="/profile"
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-medium transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30"
          >
            Profile
          </Link>
          <button className="md:hidden">
            <Menu size={24} />
          </button>
        </div>
      )}
    </nav>
  );
}
