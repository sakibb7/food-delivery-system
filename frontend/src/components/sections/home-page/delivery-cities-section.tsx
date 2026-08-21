"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { publicInstance } from "@/configs/axiosConfig";

// Fallback city images — mapped by city name
import dhakaImg from "@/../public/dhaka.jpg";
import chattogramImg from "@/../public/chattogram.webp";
import rangpur from "@/../public/rangpur.jpg";
import sylhetImg from "@/../public/sylhet.jpg";
import khulnaImg from "@/../public/khulna.jpg";
import rajshahiImg from "@/../public/rajshahi.jpg";
import mymensinghImg from "@/../public/mymensing.jpg";
import barishal from "@/../public/barisal.jpg";
import { StaticImageData } from "next/image";
import SmartImage from "@/components/ui/SmartImage";

const cityImageMap: Record<string, StaticImageData> = {
  dhaka: dhakaImg,
  chattogram: chattogramImg,
  chittagong: chattogramImg,
  sylhet: sylhetImg,
  khulna: khulnaImg,
  rajshahi: rajshahiImg,
  mymensingh: mymensinghImg,
  rangpur: rangpur,
  barishal: barishal,
  barisal: barishal,
};

// Fallback generic images for cities without a mapped image
const fallbackCityImages = [dhakaImg, chattogramImg, sylhetImg, khulnaImg, rajshahiImg, mymensinghImg, rangpur, barishal];

interface CityData {
  city: string;
  count: number;
}

export default function DeliveryCitiesSection() {
  const router = useRouter();
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await publicInstance.get("/restaurant/cities");
        setCities(res.data?.cities || []);
      } catch (err) {
        console.error("Failed to fetch cities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  const handleCityClick = (cityName: string) => {
    router.push(`/restaurants?city=${encodeURIComponent(cityName)}`);
  };

  const getCityImage = (cityName: string, index: number) => {
    const mapped = cityImageMap[cityName.toLowerCase()];
    if (mapped) return mapped;
    return fallbackCityImages[index % fallbackCityImages.length];
  };

  const visibleCities = showAll ? cities : cities.slice(0, 8);
  const hasMoreCities = cities.length > 8;

  return (
    <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
        We deliver to:
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-red-500" size={36} />
        </div>
      ) : cities.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No delivery cities available yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {visibleCities.map((city, i) => (
              <div
                key={city.city}
                onClick={() => handleCityClick(city.city)}
                className="group relative h-48 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <Image
                  src={getCityImage(city.city, i)}
                  alt={city.city}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-lg leading-tight mb-1">
                    {city.city}
                  </h3>
                  <p className="text-gray-300 text-xs">
                    {city.count} {city.count === 1 ? "Restaurant" : "Restaurants"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {hasMoreCities && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-2 bg-[#E60000] hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors cursor-pointer"
              >
                <span>{showAll ? "Show Less" : `Show ${cities.length - 8} More Cities`}</span>
                {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
