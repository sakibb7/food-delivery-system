"use client";

import Header from "@/components/layout/Header";
import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser, user, isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getUser();
    // if (!isAuthenticated && !isLoading && !user) {
    // }
  }, [getUser]);

  // Redirect unauthenticated users to sign-in
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/sign-in?redirectUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header variant="solid" />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
