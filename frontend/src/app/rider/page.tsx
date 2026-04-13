import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  DollarSign,
  Smartphone,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export default function RiderPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Navbar */}
      <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-6 py-4 lg:px-12 bg-black/10 backdrop-blur-md transition-all text-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-red-600 text-white p-2 rounded-xl font-bold text-xl tracking-tight">
            T
          </div>
          <span className="font-extrabold text-2xl tracking-tight">
            Tomato. <span className="font-medium text-red-400 text-sm ml-1 uppercase tracking-widest hidden sm:inline-block">Deliver</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/rider-sign-up"
            className="bg-white hover:bg-gray-100 text-black px-6 py-2.5 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Become a Rider
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[700px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10" />
          <Image
            src="/rider-hero-bg.png"
            alt="Delivery Rider Hero"
            className="object-cover object-center scale-105"
            priority
            fill
          />
        </div>

        <div className="relative z-20 px-6 lg:px-12 w-full max-w-7xl mx-auto flex flex-col pt-20">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold px-4 py-1.5 rounded-full mb-6">
              Be your own boss
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight leading-[1] italic">
              Deliver <span className="text-red-500">Freedom</span>, Earn Big.
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-10 font-medium drop-shadow-md max-w-2xl">
              Turn your bike or scooter into an earnings machine. Join the Tomato fleet and start delivering delicious moments to your city today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/rider-sign-up"
                className="bg-red-600 hover:bg-red-700 text-white rounded-full px-10 py-5 font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-red-600/40 flex items-center justify-center gap-3"
              >
                Sign Up Now <ArrowRight size={24} />
              </Link>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full px-10 py-5 font-bold text-xl transition-all flex items-center justify-center">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                <DollarSign size={32} />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900">$25 - $35</h4>
                <p className="text-gray-500 font-medium">Avg. Earnings / Hr</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <Clock size={32} />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900">100% Flexible</h4>
                <p className="text-gray-500 font-medium">Work on your schedule</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                <MapPin size={32} />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900">50+ Cities</h4>
                <p className="text-gray-500 font-medium">Operating nationwide</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight italic">
            Why ride with <span className="text-red-600">Tomato?</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            We don't just deliver food; we deliver opportunities. Experience the best perks in the delivery industry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "Instant Cash-Out",
              desc: "Don't wait till Friday. Get your earnings transferred instantly to your bank account after every delivery.",
              icon: <DollarSign className="w-8 h-8" />,
              color: "bg-emerald-50 text-emerald-600 border-emerald-100",
            },
            {
              title: "Full Flexibility",
              desc: "Morning bird or night owl? Choose whenever you want to work. No minimum hours, no fixed shifts.",
              icon: <Clock className="w-8 h-8" />,
              color: "bg-blue-50 text-blue-600 border-blue-100",
            },
            {
              title: "Insurance Coverage",
              desc: "Safety is our priority. Get comprehensive insurance coverage while you're on the road with us.",
              icon: <ShieldCheck className="w-8 h-8" />,
              color: "bg-red-50 text-red-600 border-red-100",
            },
            {
              title: "Rider Community",
              desc: "Join a thriving community of riders. Get exclusive discounts on vehicles, maintenance, and gear.",
              icon: <Smartphone className="w-8 h-8" />,
              color: "bg-purple-50 text-purple-600 border-purple-100",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:border-red-200 hover:shadow-2xl hover:shadow-red-500/10 transition-all group"
            >
              <div className={`${item.color} w-16 h-16 rounded-3xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
              <h2 className="text-5xl font-extrabold mb-8 tracking-tight">
                Getting started is <span className="text-red-500">Fast & Easy</span>
              </h2>
              <p className="text-xl text-gray-400 mb-12">
                Join the Tomato fleet in just a few simple steps. Most riders start earning within 48 hours.
              </p>

              <div className="space-y-12">
                {[
                  {
                    title: "Apply Online",
                    desc: "Submit your basic info, vehicle type, and background check documents through our simple form.",
                    step: "01",
                  },
                  {
                    title: "Get Your Kit",
                    desc: "Once approved, grab your professional delivery bag and gear from our local distribution center.",
                    step: "02",
                  },
                  {
                    title: "Start Delivering",
                    desc: "Turn on the app, accept your first delivery, and start watching the earnings roll in.",
                    step: "03",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/20 flex items-center justify-center font-bold text-2xl group-hover:bg-red-600 group-hover:border-red-600 transition-all">
                        {item.step}
                      </div>
                      {i !== 2 && <div className="w-0.5 h-16 bg-white/10 mt-4"></div>}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold mb-3 mt-3">{item.title}</h4>
                      <p className="text-gray-400 text-lg leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16">
                <Link
                  href="/rider-sign-up"
                  className="inline-flex items-center gap-2 text-red-500 font-bold text-xl hover:gap-4 transition-all"
                >
                  Start your application <ChevronRight size={24} />
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="relative z-10 rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl skew-x-[-2deg]">
                <Image
                  src="/rider-hero-bg.png"
                  alt="App Preview"
                  width={500}
                  height={800}
                  className="object-cover h-[600px] w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-12">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white font-medium">Daily Earnings</span>
                      <span className="text-green-500 font-bold">$184.20</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Social Proof */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-16 tracking-tight">
            Hear from our <span className="text-red-500">Rider Community</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Tomato gives me the flexibility I need to balance my studies and my income. The instant payouts are a lifesaver!",
                author: "Carlos M.",
                role: "Rider since 2024",
                city: "London"
              },
              {
                quote: "I've tried other platforms, but Tomato's support and rider perks are unmatched. I feel like part of a team here.",
                author: "Sarah L.",
                role: "Full-time Rider",
                city: "Manchester"
              },
              {
                quote: "The app is so intuitive. I can maximize my earnings by seeing busy areas in real-time. Truly the best gig out there.",
                author: "David K.",
                role: "Part-time Rider",
                city: "Bristol"
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-gray-50 p-12 rounded-[3rem] text-left hover:bg-red-50 transition-colors group">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(i => <CheckCircle2 key={i} size={20} className="text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-xl text-gray-700 italic mb-8 leading-relaxed">"{t.quote}"</p>
                <div>
                  <div className="font-bold text-gray-900 text-lg">{t.author}</div>
                  <div className="text-gray-500">{t.role} • {t.city}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-red-600 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-red-500/30">
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold mb-8 relative z-10 leading-tight">
            Your journey <br /> starts here.
          </h2>
          <p className="text-2xl text-red-100 mb-12 max-w-2xl mx-auto relative z-10">
            Sign up in 5 minutes and start earning today. Join the most rider-friendly platform in the world.
          </p>
          <div className="relative z-10">
            <Link
              href="/rider-sign-up"
              className="bg-white text-red-600 font-extrabold text-2xl py-6 px-16 rounded-full inline-block hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="bg-red-600 text-white p-2 rounded-xl font-bold text-xl tracking-tight">T</div>
              <span className="font-extrabold text-2xl tracking-tight">Tomato.</span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Join the movement that's changing the way cities eat, deliver, and earn.
            </p>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-lg">Company</h5>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-lg">Legal</h5>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/terms" className="hover:text-white transition-colors">Rider Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-lg">Download App</h5>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors">
                <Smartphone size={24} className="text-red-500" />
                <div>
                  <div className="text-xs text-gray-400 uppercase">Get it on</div>
                  <div className="font-bold">Google Play</div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors">
                <Smartphone size={24} className="text-blue-500" />
                <div>
                  <div className="text-xs text-gray-400 uppercase">Download on</div>
                  <div className="font-bold">App Store</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© 2026 Tomato Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Twitter</a>
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
