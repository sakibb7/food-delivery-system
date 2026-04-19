"use client"
import Image from "next/image";
import heroImg from "../../../../public/hero-bg.png"
import { MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppData } from "@/context/useAppData";

export interface LocationData {
    latitude: number;
    longitude: number;
    formattedAddress: string;
}

export default function HeroSection() {
    const { location } = useAppData()

    return (
        <section className="relative h-[80vh] min-h-150 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/60 to-gray-50 z-10" />
                <div className="animate-pulse-slow w-full h-full">
                    <Image
                        src={heroImg}
                        alt="Delicious food background"
                        className="object-cover object-center w-full h-full"
                        priority
                    />
                </div>
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
                        <MapPin className="text-red-500 shrink-0" size={20} />
                        <input
                            type="text"
                            placeholder={location?.formattedAddress}

                            className="bg-transparent focus:outline-none w-full text-gray-800"
                        />
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 sm:flex-1 text-gray-500">
                        <Search className="text-gray-400 shrink-0" size={20} />
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
    )
}
