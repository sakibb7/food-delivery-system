import React from "react";
import ProtectedHeader from "@/components/ProtectedHeader";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <ProtectedHeader />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
