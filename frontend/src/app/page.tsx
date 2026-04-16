import Image from "next/image";
import Header from "@/components/layout/Header";
import FooterSection from "@/components/layout/footer";
import HeroSection from "@/components/sections/home-page/hero-section";

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


      {/* CTA Section */}
      <section className="bg-red-50 py-20 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Get the Tomato app
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            We will send you a link, open it on your phone to download the app
            and experience order tracking and much more!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email address"
              className="px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent flex-1 shadow-sm"
            />
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all hover:shadow-lg hover:shadow-red-600/30">
              Share App Link
            </button>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
