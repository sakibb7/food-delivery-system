import Image from "next/image";

export default function AppDownloadSection() {
  return (
    <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full overflow-hidden">
      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-[3rem] p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

        <div className="flex-1 text-center md:text-left relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            The best food delivery <br className="hidden lg:block" /> 
            app in your pocket
          </h2>
          <p className="text-red-100 text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
            Experience the fastest delivery and live order tracking with our mobile app. 
            Get exclusive deals and manage your orders on the go.
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <button className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg">
              <Image src="/apple.svg" alt="Apple" width={24} height={24} />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold leading-none">Download on the</p>
                <p className="text-lg font-bold leading-none">App Store</p>
              </div>
            </button>
            <button className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg">
              <Image src="/google.svg" alt="Google Play" width={24} height={24} />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold leading-none">Get it on</p>
                <p className="text-lg font-bold leading-none">Google Play</p>
              </div>
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center md:justify-start gap-4 text-white/80">
             <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-red-600 bg-gray-200 overflow-hidden ring-2 ring-red-400">
                        <Image src={`/burger.png`} alt="User" width={40} height={40} className="object-cover" />
                    </div>
                ))}
             </div>
             <p className="text-sm font-medium">Joined by <span className="text-white font-bold text-base">10k+</span> happy foodies</p>
          </div>
        </div>

        <div className="flex-1 relative z-10 w-full max-w-md md:max-w-none">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-white/20 rounded-[2.5rem] blur-2xl group-hover:bg-white/30 transition-all duration-500"></div>
            
            <Image
              src="/app-mockup.png"
              alt="App Mockup"
              width={500}
              height={1000}
              className="relative rounded-[2.5rem] shadow-2xl transform rotate-2 md:rotate-6 group-hover:rotate-0 transition-transform duration-700 ease-out"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
