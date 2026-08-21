"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import FooterSection from "@/components/layout/footer";
import HeroSection from "@/components/sections/home-page/hero-section";
import DeliveryCitiesSection from "@/components/sections/home-page/delivery-cities-section";
import JoinUsSection from "@/components/sections/home-page/join-us-section";
import FeaturesSection from "@/components/sections/home-page/features-section";
import AppDownloadSection from "@/components/sections/home-page/app-download-section";
import { publicInstance } from "@/configs/axiosConfig";
import { Loader2 } from "lucide-react";

// Fallback images for cuisines
import food1 from "@/../public/restaurents/restaurant-1.jpg";
import food2 from "@/../public/restaurents/restaurant-2.jpg";
import food3 from "@/../public/restaurents/restaurant-3.jpg";
import food4 from "@/../public/restaurents/restaurant-4.jpg";
import food5 from "@/../public/restaurents/restaurant-5.jpg";
import food6 from "@/../public/restaurents/restaurant-6.jpg";
import food7 from "@/../public/restaurents/restaurant-7.jpg";
import food8 from "@/../public/restaurents/restaurant-8.jpg";
import food9 from "@/../public/restaurents/restaurant-9.jpg";
import food10 from "@/../public/restaurents/restaurant-10.jpg";
import food11 from "@/../public/restaurents/restaurant-11.jpg";
import food12 from "@/../public/restaurents/restaurant-12.jpg";

const fallbackImages = [food1, food2, food3, food4, food5, food6, food7, food8, food9, food10, food11, food12];

interface CuisineData {
  cuisine: string;
  count: number;
}

export default function Home() {
  const router = useRouter();
  const [cuisines, setCuisines] = useState<CuisineData[]>([]);
  const [loadingCuisines, setLoadingCuisines] = useState(true);

  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const res = await publicInstance.get("/restaurant/cuisines");
        setCuisines(res.data?.cuisines || []);
      } catch (err) {
        console.error("Failed to fetch cuisines:", err);
      } finally {
        setLoadingCuisines(false);
      }
    };
    fetchCuisines();
  }, []);

  const handleCuisineClick = (cuisineName: string) => {
    router.push(`/restaurants?cuisine=${encodeURIComponent(cuisineName)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header variant="transparent" />
      <HeroSection />

      {/* Categories */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Inspiration for your first order
            </h2>
            <p className="text-gray-500">
              Explore our wide variety of categories
            </p>
          </div>
        </div>

        {loadingCuisines ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-red-500" size={36} />
          </div>
        ) : cuisines.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No categories available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {cuisines.slice(0, 12).map((item, i) => (
              <div
                key={item.cuisine}
                onClick={() => handleCuisineClick(item.cuisine)}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="size-32 xl:size-40 rounded-full overflow-hidden shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 ring-4 ring-transparent group-hover:ring-red-100 mb-3 relative">
                  <Image
                    src={fallbackImages[i % fallbackImages.length]}
                    alt={item.cuisine}
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-red-500 transition-colors text-lg sm:text-xl">
                  {item.cuisine}
                </span>
                <span className="text-xs text-gray-400 mt-0.5">
                  {item.count} {item.count === 1 ? "restaurant" : "restaurants"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <DeliveryCitiesSection />
      <JoinUsSection />
      <FeaturesSection />
      <AppDownloadSection />

      <FooterSection />
    </div>
  );
}
