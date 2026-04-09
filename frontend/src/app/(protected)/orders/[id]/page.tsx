import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, MapPin, Receipt, Star, Phone, MessageSquare } from 'lucide-react';
import Image from 'next/image';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  // Static mock data for now
  const orderId = params.id;
  const isDelivered = true;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Order #{orderId}</h1>
          <p className="text-gray-500 font-medium text-sm">Placed on Oct 14, 2026 at 1:30 PM</p>
        </div>
        <span className={`ml-auto px-4 py-1.5 rounded-full text-sm font-bold ${isDelivered ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {isDelivered ? 'Delivered' : 'Processing'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Tracker */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Status</h2>
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>
              
              <div className="relative flex items-start gap-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white z-10 shadow-sm shadow-green-200">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Order Placed</h3>
                  <p className="text-sm text-gray-500">1:30 PM</p>
                </div>
              </div>
              
              <div className="relative flex items-start gap-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white z-10 shadow-sm shadow-green-200">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Order Accepted</h3>
                  <p className="text-sm text-gray-500">1:35 PM</p>
                </div>
              </div>
              
              <div className="relative flex items-start gap-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white z-10 shadow-sm shadow-green-200">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Out for Delivery</h3>
                  <p className="text-sm text-gray-500">2:05 PM</p>
                </div>
              </div>
              
              <div className="relative flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white z-10 shadow-sm shadow-green-200">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-green-600">Delivered</h3>
                  <p className="text-sm text-gray-500">2:25 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Receipt size={20} className="text-gray-400" /> Items Summary
            </h2>
            <div className="divide-y divide-gray-100">
              <div className="py-4 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-600 text-sm">
                    1x
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-red-500 transition-colors">Large Pepperoni Pizza</h4>
                    <p className="text-sm text-gray-500">Extra cheese, Thin crust</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900">$18.50</span>
              </div>
              <div className="py-4 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-600 text-sm">
                    2x
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-red-500 transition-colors">Coke</h4>
                    <p className="text-sm text-gray-500">Medium</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900">$6.00</span>
              </div>
            </div>
            
            <div className="pt-6 mt-2 border-t border-dashed border-gray-200">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Subtotal</span>
                <span className="font-medium font-mono">$24.50</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Delivery Fee</span>
                <span className="font-medium font-mono">$2.00</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 mb-4">
                <span>Discount (PROMO)</span>
                <span className="font-medium font-mono">-$3.00</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-2xl text-red-600 font-mono">$23.50</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Restaurant Info */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Restaurant</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl border border-gray-100 relative overflow-hidden flex-shrink-0">
                 <Image src="/pizza.png" alt="Pizza Hut" fill className="object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 line-clamp-1">Pizza Hut</h4>
                <div className="flex items-center text-sm text-gray-500 mt-0.5">
                  <Star size={14} className="text-yellow-400 mr-1" fill="currentColor" /> 4.5 (10k+ ratings)
                </div>
              </div>
            </div>
            <Link href="#" className="w-full block text-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold rounded-xl transition-colors text-sm">
              View Menu
            </Link>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Delivery</h3>
            <div className="flex gap-4 mb-5">
              <MapPin size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Home</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  123 Main Street, Apt 4B<br />Dhaka, Bangladesh
                </p>
              </div>
            </div>
            
            {/* Driver */}
            <div className="pt-5 border-t border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Delivery Partner</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                    JD
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">John Doe</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Star size={12} className="text-yellow-400" fill="currentColor" /> 4.9</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors">
                    <Phone size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                    <MessageSquare size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/30">
            Reorder this exact meal
          </button>
        </div>
      </div>
    </div>
  );
}
