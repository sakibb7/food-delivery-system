import { Bike, MapPin, Store } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Super fast Delivery",
      description:
        "Faster than your cravings can blink. Experience the super-fast delivery and get fresh food.",
      icon: (
        <div className="relative w-32 h-32 flex items-center justify-center bg-red-50 rounded-full mb-6">
          <Bike className="w-16 h-16 text-[#E60000]" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
            <div className="w-4 h-1 bg-[#E60000] rounded-full opacity-40"></div>
            <div className="w-6 h-1 bg-[#E60000] rounded-full opacity-60"></div>
            <div className="w-4 h-1 bg-[#E60000] rounded-full opacity-40"></div>
          </div>
        </div>
      ),
    },
    {
      title: "Live Order Tracking",
      description:
        "Track your order while it is delivered to your doorstep from the restaurant.",
      icon: (
        <div className="relative w-32 h-32 flex items-center justify-center bg-red-50 rounded-full mb-6">
          <MapPin className="w-16 h-16 text-[#E60000]" />
          <svg
            className="absolute inset-0 w-full h-full p-4"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 80 Q 50 20 80 80"
              stroke="#E60000"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="opacity-30"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Your Favorite Restaurants",
      description:
        "Find the best and nearest top your favorite restaurants from your selected location.",
      icon: (
        <div className="relative w-32 h-32 flex items-center justify-center bg-red-50 rounded-full mb-6">
          <Store className="w-16 h-16 text-[#E60000]" />
          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-100">
             <div className="w-6 h-6 bg-red-500 rounded-full"></div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full">
      <div className="grid md:grid-cols-3 gap-12">
        {features.map((feature, i) => (
          <div key={i} className="flex flex-col items-center text-center group">
            <div className="transform group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
