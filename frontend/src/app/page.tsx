import Image from "next/image";
import Header from "@/components/layout/Header";
import FooterSection from "@/components/layout/footer";
import HeroSection from "@/components/sections/home-page/hero-section";
import DeliveryCitiesSection from "@/components/sections/home-page/delivery-cities-section";
import JoinUsSection from "@/components/sections/home-page/join-us-section";
import FeaturesSection from "@/components/sections/home-page/features-section";
import AppDownloadSection from "@/components/sections/home-page/app-download-section";

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

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
          {[
            { name: "Burger", img: "/burger.png" },
            { name: "Pizza", img: "/pizza.png" },
            { name: "Sushi", img: "/sushi.png" },
            { name: "Healthy", img: "/hero-bg.png" },
            { name: "Fast Food", img: "/burger.png" },
            { name: "Drinks", img: "/pizza.png" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 ring-4 ring-transparent group-hover:ring-red-100 mb-3 relative">
                <Image
                  src={item.img}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-red-500 transition-colors">
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
