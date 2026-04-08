"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-16 lg:px-24 xl:px-36 py-12 justify-center relative">
        {/* Logo */}
        <Link href="/" className="absolute top-8 left-8 sm:left-16 lg:left-24 xl:left-36 flex items-center gap-2 group z-10 w-fit">
          <div className="bg-red-600 group-hover:bg-red-700 text-white p-2 rounded-xl font-bold text-xl tracking-tight transition-colors">T</div>
          <span className="font-extrabold text-2xl tracking-tight text-gray-900 group-hover:text-red-700 transition-colors">Tomato.</span>
        </Link>

        {/* Content */}
        <div className="max-w-md w-full mx-auto sm:mx-0 mt-16 lg:mt-0">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Create an account</h1>
          <p className="text-gray-500 mb-10">Sign up to start ordering the most delicious food near you.</p>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="name">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  id="name"
                  placeholder="John Doe" 
                  className="pl-11 w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input 
                  type="email" 
                  id="email"
                  placeholder="name@example.com" 
                  className="pl-11 w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••" 
                  className="pl-11 pr-12 w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Must be at least 8 characters long.</p>
            </div>

            <button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-4 font-bold text-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-red-600/30 flex justify-center items-center gap-2 group"
            >
              Sign Up <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center text-gray-500 font-medium text-sm">
            Already have an account? <Link href="/login" className="text-red-600 font-bold hover:text-red-700 hover:underline">Log in</Link>
          </div>
          
          <div className="mt-12 flex items-center">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="px-4 text-xs font-semibold text-gray-400 tracking-wider">OR CONTINUE WITH</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm font-bold">
             <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
             </button>
             <button className="flex items-center justify-center gap-2 bg-gray-900 border border-gray-900 rounded-xl py-3 text-white hover:bg-gray-800 transition-colors">
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
               GitHub
             </button>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block w-1/2 relative p-4">
        <div className="absolute inset-0 m-4 rounded-[2.5rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent z-10" />
          <Image 
            src="/hero-bg.png" 
            alt="Sign up delicious background"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute bottom-16 left-16 right-16 z-20 text-white">
            <h2 className="text-4xl font-extrabold mb-4 leading-tight">Join thousands of foodies today.</h2>
            <p className="text-lg text-gray-300 font-medium">Get exclusive access to the best restaurants in town, track your orders in real-time, and earn rewards points with every meal.</p>
            
            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-300 overflow-hidden"><Image src="/burger.png" width={40} height={40} alt="user" className="object-cover"/></div>
                <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-400 overflow-hidden"><Image src="/pizza.png" width={40} height={40} alt="user" className="object-cover"/></div>
                <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-500 overflow-hidden"><Image src="/sushi.png" width={40} height={40} alt="user" className="object-cover"/></div>
              </div>
              <p className="font-semibold text-sm">Join 10,000+ others</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
