import Image from "next/image";
import { Settings } from "lucide-react";
import dhakaImg from "@/../public/dhaka.jpg";
import chattogramImg from "@/../public/chattogram.webp";
import rangpur from "@/../public/rangpur.jpg";
import sylhetImg from "@/../public/sylhet.jpg";
import khulnaImg from "@/../public/khulna.jpg";
import rajshahiImg from "@/../public/rajshahi.jpg";
import mymensinghImg from "@/../public/mymensing.jpg";
import barishal from "@/../public/barisal.jpg";


const cities = [
  { name: "Dhaka", count: "3453", image: dhakaImg },
  { name: "Chattogram", count: "368", image: chattogramImg },
  { name: "Sylhet", count: "170", image: sylhetImg },
  { name: "Khulna", count: "163", image: khulnaImg },
  { name: "Rajshahi", count: "116", image: rajshahiImg },
  { name: "Mymensingh", count: "84", image: mymensinghImg },
  { name: "Rangpur", count: "118", image: rangpur },
  { name: "Barishal", count: "118", image: barishal },

];

export default function DeliveryCitiesSection() {
  return (
    <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
        We deliver to:
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {cities.map((city, i) => (
          <div
            key={i}
            className="group relative h-48 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <Image
              src={city.image}
              alt={city.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-white font-bold text-lg leading-tight mb-1">
                {city.name}
              </h3>
              <p className="text-gray-300 text-xs">
                {city.count} Restaurants
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button className="flex items-center gap-2 bg-[#E60000] hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
          <span>Show More 14 Cities</span>
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
