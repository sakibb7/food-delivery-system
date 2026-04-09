import React from 'react';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase } from 'lucide-react';

const savedAddresses = [
  { id: 1, title: "Home", address: "123 Main Street, Apt 4B, Dhaka, Bangladesh, 1205", icon: Home, isDefault: true },
  { id: 2, title: "Work", address: "456 Corporate Blvd, Floor 8, Dhaka, Bangladesh, 1212", icon: Briefcase, isDefault: false },
];

export default function AddressesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center sm:text-left">Saved Addresses</h1>
          <p className="text-gray-500 mt-1 font-medium text-center sm:text-left">Manage your delivery locations.</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm">
          <Plus size={18} /> Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savedAddresses.map((addr) => (
          <div key={addr.id} className={`bg-white rounded-3xl p-6 shadow-sm border transition-all ${addr.isDefault ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-100 hover:border-gray-300'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${addr.isDefault ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                  <addr.icon size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {addr.title}
                    {addr.isDefault && (
                      <span className="bg-red-600 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md">Default</span>
                    )}
                  </h2>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="pl-15">
              <p className="text-gray-600 leading-relaxed max-w-sm ml-15 flex items-start gap-2">
                <MapPin size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
                {addr.address}
              </p>
            </div>
            
            {!addr.isDefault && (
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button className="text-sm font-semibold text-red-600 hover:text-red-700">
                  Set as Default
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
