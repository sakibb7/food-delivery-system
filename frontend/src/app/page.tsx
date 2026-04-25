import Image from "next/image";
import Header from "@/components/layout/Header";
import FooterSection from "@/components/layout/footer";
import HeroSection from "@/components/sections/home-page/hero-section";
import DeliveryCitiesSection from "@/components/sections/home-page/delivery-cities-section";
import JoinUsSection from "@/components/sections/home-page/join-us-section";
import FeaturesSection from "@/components/sections/home-page/features-section";
import AppDownloadSection from "@/components/sections/home-page/app-download-section";
import food1 from "@/../public/restaurents/restaurant-1.jpg"
import food2 from "@/../public/restaurents/restaurant-2.jpg"
import food3 from "@/../public/restaurents/restaurant-3.jpg"
import food4 from "@/../public/restaurents/restaurant-4.jpg"
import food5 from "@/../public/restaurents/restaurant-5.jpg"
import food6 from "@/../public/restaurents/restaurant-6.jpg"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { name: "Burger", img: food1 },
            { name: "Pizza", img: food2 },
            { name: "Sushi", img: food3 },
            { name: "Healthy", img: food4 },
            { name: "Fast Food", img: food5 },
            { name: "Drinks", img: food6 },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="size-32 xl:size-40 rounded-full overflow-hidden shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 ring-4 ring-transparent group-hover:ring-red-100 mb-3 relative">
                <Image
                  src={item.img}
                  alt={item.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-red-500 transition-colors text-lg sm:text-xl">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      <DeliveryCitiesSection />
      <JoinUsSection />
      <FeaturesSection />
      <AppDownloadSection />

      <FooterSection />
    </div>
  );
}
