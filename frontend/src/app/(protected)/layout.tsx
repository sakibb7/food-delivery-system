"use client";
import ProtectedHeader from "@/components/ProtectedHeader";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: user,
    refetch,
    isLoading: isUserLoading,
  } = useGetQuery({
    isPublic: false,
    url: "/user/me",
    queryKey: "user",
  });

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  console.log(user, "user");

  // console.log(user);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <ProtectedHeader />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
