import Image from "next/image";
import { Settings } from "lucide-react";

const cities = [
  { name: "Dhaka", count: "3453", image: "https://images.unsplash.com/photo-1608928095147-380e227090b8?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Chattogram", count: "368", image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Narayanganj", count: "186", image: "https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Sylhet", count: "170", image: "https://images.unsplash.com/photo-1587313632749-0197779d7494?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Khulna", count: "163", image: "https://images.unsplash.com/photo-1580327484310-745a3598db4c?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Bogra", count: "118", image: "https://images.unsplash.com/photo-1610313063851-40915f2122fb?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Rajshahi", count: "116", image: "https://images.unsplash.com/photo-1622396113615-5ec7968db75e?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Cumilla", count: "91", image: "https://images.unsplash.com/photo-1605648834466-24e0544a0e10?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Mymensingh", count: "84", image: "https://images.unsplash.com/photo-1584061845116-43baf2bd673d?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Tangail", count: "43", image: "https://images.unsplash.com/photo-1599827056636-f08916d7a421?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Gazipur", count: "39", image: "https://images.unsplash.com/photo-1570183188574-d421d0033100?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Coxs Bazar", count: "30", image: "https://images.unsplash.com/photo-1588607185078-2d83b9cfab13?auto=format&fit=crop&q=80&w=400&h=400" },
];

export default function DeliveryCitiesSection() {
  return (
    <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
        We deliver to:
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
