"use client";

import ProtectedHeader from "@/components/ProtectedHeader";
import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser, user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      getUser();
    }
  }, []);

  console.log(isLoading);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-red-600"></div>
      </div>
    );
  }

  // if (!user) {
  //   router.replace("/sign-in");
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <ProtectedHeader />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
