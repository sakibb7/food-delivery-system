import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Clock,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";

export default function CheckoutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Checkout
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Pizza Hut &bull; 2 items
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column - Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Delivery Address
              </h2>
              <button className="text-red-600 font-semibold text-sm hover:text-red-700">
                Change
              </button>
            </div>

            <div className="flex gap-4 p-4 border-2 border-red-500 rounded-2xl bg-red-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full mix-blend-multiply opacity-50"></div>
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex justify-center items-center flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">Home</h3>
                  <span className="bg-red-600 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md">
                    Default
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  123 Main Street, Apt 4B
                  <br />
                  Dhaka, Bangladesh, 1205
                </p>
                <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
                  Phone:{" "}
                  <span className="font-medium text-gray-700">
                    +880 1712 345678
                  </span>
                </p>
              </div>
            </div>

            <button className="w-full mt-4 py-3 border border-dashed border-gray-300 rounded-2xl text-gray-600 font-semibold hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2">
              <Plus size={18} /> Add New Address
            </button>
          </div>

          {/* Delivery Time */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Delivery Time
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-red-500 bg-red-50 rounded-2xl p-4 cursor-pointer relative">
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border-2 border-white"></div>
                <Clock className="text-red-500 mb-2" size={24} />
                <h3 className="font-bold text-gray-900">Standard</h3>
                <p className="text-sm text-gray-600">30-45 mins</p>
              </div>
              <div className="border border-gray-200 hover:border-gray-300 bg-white rounded-2xl p-4 cursor-pointer transition-colors">
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full border-2 border-gray-300 hidden"></div>
                <Clock className="text-gray-400 mb-2" size={24} />
                <h3 className="font-bold text-gray-900">Schedule</h3>
                <p className="text-sm text-gray-500">Pick a time</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Payment Method
              </h2>
              <button className="text-red-600 font-semibold text-sm hover:text-red-700">
                Add New
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border-2 border-red-500 bg-red-50 rounded-2xl cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-black rounded flex justify-center items-center text-white font-bold text-xs italic">
                    VISA
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      Visa ending in 4242
                    </p>
                    <p className="text-xs text-gray-500">Expires 12/28</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-4 border-red-500 bg-white"></div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 hover:border-gray-300 rounded-2xl cursor-pointer transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-green-500 rounded flex justify-center items-center text-white font-bold text-xs text-center leading-tight">
                    Cash
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">
                      Pay when you receive
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
            <div className="p-6 bg-gray-50/50 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Items */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0">
                    <Image
                      src="/pizza.png"
                      alt="Pizza"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 leading-tight">
                        Large Pepperoni Pizza
                      </h4>
                      <span className="font-bold text-gray-900">$18.50</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Extra cheese, Thin crust
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex justify-center items-center text-gray-600 hover:bg-gray-50">
                          -
                        </button>
                        <span className="font-bold">1</span>
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex justify-center items-center text-gray-600 hover:bg-gray-50">
                          +
                        </button>
                      </div>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0">
                    <Image
                      src="/burger.png"
                      alt="Burger"
                      className="object-cover"
                      width={96}
                      height={96}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 leading-tight">
                        Coke (Medium)
                      </h4>
                      <span className="font-bold text-gray-900">$6.00</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex justify-center items-center text-gray-600 hover:bg-gray-50">
                          -
                        </button>
                        <span className="font-bold">2</span>
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex justify-center items-center text-gray-600 hover:bg-gray-50">
                          +
                        </button>
                      </div>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo Code"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors"
                  />
                  <button className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="pt-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900 font-mono">
                    $24.50
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-gray-900 font-mono">
                    $2.00
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes</span>
                  <span className="font-medium text-gray-900 font-mono">
                    $1.50
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 p-6 text-white">
              <div className="flex justify-between items-center mb-6">
                <span className="font-medium text-gray-300">Total to pay</span>
                <span className="font-extrabold text-2xl font-mono">
                  $28.00
                </span>
              </div>
              <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-red-600/40 flex justify-center items-center gap-2 text-lg">
                Place Order <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
