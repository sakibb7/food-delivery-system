import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Star, Clock, ChevronRight, User, Menu } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-6 py-4 lg:px-12 bg-black/20 backdrop-blur-sm shadow-sm transition-all text-white">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 text-white p-2 rounded-xl font-bold text-xl tracking-tight">T</div>
          <span className="font-extrabold text-2xl tracking-tight">Tomato.</span>
        </div>
        
        <div className="hidden md:flex gap-8 font-medium">
          <Link href="/" className="hover:text-red-400 transition-colors">Home</Link>
          <Link href="#" className="hover:text-red-400 transition-colors">Order</Link>
          <Link href="#" className="hover:text-red-400 transition-colors">Dining Out</Link>
          <Link href="#" className="hover:text-red-400 transition-colors">Pro</Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:flex items-center gap-2 font-medium hover:text-red-400 transition-colors">
            <User size={20} />
            Log in
          </Link>
          <Link href="/signup" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-medium transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30">
            Sign up
          </Link>
          <button className="md:hidden">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image Image component would be best but standard img works fine */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-50 z-10" />
          <Image 
            src="/hero-bg.png"
            alt="Delicious food background"
            fill
            className="object-cover object-center scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
            priority
          />
        </div>

        <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl pt-20">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-md tracking-tight">
            Discover the best food & drinks
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 font-medium drop-shadow">
            Freshly prepared meals delivered hot to your doorstep.
          </p>

          <div className="w-full max-w-3xl flex flex-col sm:flex-row bg-white rounded-full p-2 shadow-2xl">
            <div className="flex items-center gap-3 px-4 py-3 sm:w-1/3 border-b sm:border-b-0 sm:border-r border-gray-200 text-gray-500">
              <MapPin className="text-red-500 flex-shrink-0" size={20} />
              <input 
                type="text" 
                placeholder="Ywca Camp, Dhaka" 
                className="bg-transparent focus:outline-none w-full text-gray-800"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 sm:flex-1 text-gray-500">
              <Search className="text-gray-400 flex-shrink-0" size={20} />
              <input 
                type="text" 
                placeholder="Search for restaurant, cuisine or a dish" 
                className="bg-transparent focus:outline-none w-full text-gray-800"
              />
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3 font-semibold transition-colors mt-2 sm:mt-0 shadow-md">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Inspiration for your first order</h2>
            <p className="text-gray-500">Explore our wide variety of categories</p>
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
            <div key={i} className="flex flex-col items-center group cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 ring-4 ring-transparent group-hover:ring-red-100 mb-3 relative">
                 <Image src={item.img} alt={item.name} fill className="object-cover" />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-red-500 transition-colors">{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top Restaurants */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full bg-white rounded-3xl shadow-sm mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 tracking-tight">Best Delivery Restaurants in Dhaka</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: "Burger King", tags: "Burger, Fast Food", rating: "4.5", time: "25-30 min", price: "$$", img: "/burger.png" },
            { name: "Pizza Hut", tags: "Pizza, Italian", rating: "4.2", time: "30-45 min", price: "$$", img: "/pizza.png" },
            { name: "Sushi Samurai", tags: "Sushi, Japanese, Seafood", rating: "4.8", time: "40-50 min", price: "$$$", img: "/sushi.png" },
          ].map((restaurant, i) => (
            <div key={i} className="group rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 bg-white hover:-translate-y-1 cursor-pointer flex flex-col h-full">
              <div className="relative h-56 overflow-hidden">
                <Image src={restaurant.img} alt={restaurant.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                  Promoted
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center text-gray-800 shadow-sm hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{restaurant.name}</h3>
                  <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-md text-sm font-bold shadow-sm">
                    {restaurant.rating} <Star size={14} fill="currentColor" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-1">{restaurant.tags}</p>
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-gray-400" />
                    {restaurant.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 font-normal">Approx.</span> 
                    {restaurant.price}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 flex justify-center">
          <button className="flex items-center gap-2 text-red-600 font-semibold hover:bg-red-50 px-6 py-3 rounded-full transition-colors border border-red-200">
            See all restaurants <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-50 py-20 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Get the Tomato app</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            We will send you a link, open it on your phone to download the app and experience order tracking and much more!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
             <input type="email" placeholder="Email address" className="px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent flex-1 shadow-sm" />
             <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all hover:shadow-lg hover:shadow-red-600/30">
               Share App Link
             </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-white text-gray-900 p-1.5 rounded-lg font-bold text-lg">T</div>
              <span className="font-bold text-2xl text-white">Tomato.</span>
            </div>
            <p className="text-gray-400 mb-6 text-sm">
              By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer text-white font-bold">f</div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer text-white font-bold">t</div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer text-white font-bold">in</div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">ABOUT TOMATO</h4>
            <ul className="space-y-3 font-medium text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Who We Are</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Work With Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Investor Relations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Report Fraud</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">FOR RESTAURANTS</h4>
            <ul className="space-y-3 font-medium text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Partner With Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Apps For You</a></li>
            </ul>
            <h4 className="text-white font-bold mb-6 mt-8 tracking-wide">FOR ENTERPRISES</h4>
            <ul className="space-y-3 font-medium text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Tomato For Enterprise</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">LEARN MORE</h4>
            <ul className="space-y-3 font-medium text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sitemap</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-gray-800 mt-12 pt-8 text-sm text-gray-500 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <p>© 2026 Tomato Food Delivery. All rights reserved.</p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
             <span>Made with</span>
             <span className="text-red-500 text-lg">♥</span>
             <span>for foodies everywhere</span>
          </div>
        </div>
      </footer>
    </div>
  );
}