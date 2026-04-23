import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  Store,
  Smartphone,
  Headset,
  CheckCircle,
  ArrowRight,
  Menu,
  ChevronRight,
  DollarSign,
  Clock,
  MapPin,
} from "lucide-react";

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar (similar to home, but simplified for B2B) */}
      <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-6 py-4 lg:px-12 bg-black/30 backdrop-blur-md shadow-sm transition-all text-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-red-600 text-white p-2 rounded-xl font-bold text-xl tracking-tight">
            T
          </div>
          <span className="font-extrabold text-2xl tracking-tight">
            Tekina. <span className="font-medium text-red-400 text-sm ml-1 uppercase tracking-widest hidden sm:inline-block">For Partners</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/owner-sign-up"
            className="bg-white hover:bg-gray-100 text-black px-6 py-2.5 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Register your store
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[650px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10" />
          <Image
            src="/hero-bg.png"
            alt="Restaurant partner kitchen background"
            className="object-cover object-center scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
            priority
            fill
          />
        </div>

        <div className="relative z-20 px-6 lg:px-12 w-full max-w-7xl mx-auto flex flex-col pt-20">
          <div className="max-w-2xl">
            <div className="inline-block bg-red-600/20 backdrop-blur-md border border-red-500/30 text-red-200 font-semibold px-4 py-1.5 rounded-full mb-6">
              Grow your business with us
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight leading-[1.1]">
              Reach <span className="text-red-500">more customers</span> than ever before
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 font-medium drop-shadow-md">
              Join thousands of restaurants enjoying increased revenue, seamless order management, and flexible delivery options with Tekina.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/owner-sign-up"
                className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-4 font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-600/30 flex items-center justify-center gap-2"
              >
                Sign up your store <ArrowRight size={20} />
              </Link>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full px-8 py-4 font-bold text-lg transition-all flex items-center justify-center">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
            <div className="text-center">
              <div className="text-4xl font-extrabold text-gray-900 mb-1">500k+</div>
              <div className="text-gray-500 font-medium tracking-wide">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-gray-900 mb-1">10k+</div>
              <div className="text-gray-500 font-medium tracking-wide">Restaurant Partners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-gray-900 mb-1">30%</div>
              <div className="text-gray-500 font-medium tracking-wide">Avg. Revenue Increase</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-gray-900 mb-1">24/7</div>
              <div className="text-gray-500 font-medium tracking-wide">Partner Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Partner Section */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Why partner with Tekina?
          </h2>
          <p className="text-xl text-gray-500">
            We provide all the tools you need to expand your reach, manage orders effortlessly, and grow your bottom line.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Increase your sales",
              description: "Tap into a massive network of hungry diners in your city. Our marketing tools help you stand out.",
              icon: <TrendingUp className="text-red-500 w-8 h-8" />,
              color: "bg-red-50/50 border-red-100"
            },
            {
              title: "Manage everything easily",
              description: "Our dedicated Partner Dashboard makes it simple to accept orders, manage your menu, and track revenue.",
              icon: <Store className="text-blue-500 w-8 h-8" />,
              color: "bg-blue-50/50 border-blue-100"
            },
            {
              title: "Deliver faster & safer",
              description: "Rely on our optimized logistics and fleet of professional riders to get your food to customers hot and fresh.",
              icon: <Smartphone className="text-green-500 w-8 h-8" />,
              color: "bg-green-50/50 border-green-100"
            }
          ].map((feature, i) => (
            <div key={i} className={`rounded-3xl p-8 border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border relative z-10 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 relative z-10">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed text-lg relative z-10">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works section */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                How getting started works
              </h2>
              <p className="text-xl text-gray-400 mb-12">
                We've designed a streamlined onboarding process so you can start receiving orders in less than 48 hours.
              </p>

              <div className="space-y-8">
                {[
                  { title: "Sign up online", desc: "Fill out a simple form with your basic details and submit required business documents.", step: "01" },
                  { title: "Set up your menu", desc: "Use our intuitive dashboard to upload your menu items, prices, and high-quality mouth-watering photos.", step: "02" },
                  { title: "Start receiving orders", desc: "Once approved, turn your tablet on and watch the delivery orders start pouring in.", step: "03" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group cursor-pointer text-white">
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-xl font-bold text-gray-600 group-hover:text-red-500 transition-colors bg-gray-800 rounded-full w-14 h-14 flex items-center justify-center group-hover:bg-red-500/20 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]">{item.step}</span>
                      {i !== 2 && <div className="w-0.5 h-full bg-gray-800 mt-4 group-hover:bg-red-500/30 transition-colors" />}
                    </div>
                    <div className="pb-8 pt-2">
                      <h4 className="text-2xl font-bold mb-2 group-hover:text-red-400 transition-colors">{item.title}</h4>
                      <p className="text-gray-400 text-lg">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 w-full mt-10 lg:mt-0 relative perspective-1000">
              {/* Dashboard mockup visualization */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-800 rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-700 hover:rotate-y-0 hover:rotate-x-0">
                <div className="h-8 bg-gray-900 border-b border-gray-700 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <div className="text-gray-400 font-medium text-sm mb-1">Today's Revenue</div>
                      <div className="text-3xl font-bold text-white flex items-center gap-2"><DollarSign className="text-green-500" /> 1,245.50</div>
                    </div>
                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <TrendingUp size={14} /> +14.5%
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Live Orders</div>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-gray-700/50 border border-gray-600 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-lg bg-gray-600 animate-pulse"></div>
                          <div>
                            <div className="w-24 h-4 bg-gray-500 rounded animate-pulse mb-2"></div>
                            <div className="w-16 h-3 bg-gray-600 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="w-20 h-8 bg-green-600 rounded-full animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-600 py-24 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-xl text-white">
            <Store size={32} />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Ready to grow your restaurant?
          </h2>
          <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto font-medium">
            Join Tekina today and let us help you reach more hungry customers in your neighborhood.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/owner-sign-up" className="bg-white text-red-600 font-extrabold text-lg py-4 px-10 rounded-full transition-all hover:scale-105 active:scale-95 hover:shadow-2xl shadow-lg flex items-center gap-2">
              Start Your Registration <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6 lg:px-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-6 md:mb-0">
            <div className="bg-white text-gray-900 p-1.5 rounded-lg font-bold text-lg">
              T
            </div>
            <span className="font-bold text-2xl text-white">Tekina. <span className="text-sm font-normal text-gray-500 ml-2">For Partners</span></span>
          </div>

          <div className="flex gap-6 text-sm font-medium">
            <Link href="/owner-sign-in" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/owner-sign-up" className="hover:text-white transition-colors">Sign Up</Link>
            <a href="#" className="hover:text-white transition-colors">Partner Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
