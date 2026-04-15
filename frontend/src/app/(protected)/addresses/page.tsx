"use client";

import React, { useState, useMemo } from "react";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home,
  Briefcase,
  Building2,
  X,
  Check,
  Loader2,
  Navigation,
  Star,
} from "lucide-react";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { getQueryClient } from "@/configs/query-client";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamically import the map picker to avoid SSR issues with Leaflet
const AddressMapPicker = dynamic(
  () => import("@/components/AddressMapPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">
        <MapPin size={32} className="text-gray-300" />
      </div>
    ),
  },
);

interface Address {
  id: number;
  userId: number;
  label: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  zipcode: string | null;
  latitude: string | null;
  longitude: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddressFormData {
  label: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}

const LABEL_OPTIONS = [
  { value: "Home", icon: Home, color: "text-blue-600", bg: "bg-blue-100" },
  {
    value: "Work",
    icon: Briefcase,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    value: "Other",
    icon: Building2,
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
];

const emptyForm: AddressFormData = {
  label: "Home",
  address: "",
  city: "",
  state: "",
  country: "",
  zipcode: "",
  latitude: null,
  longitude: null,
  isDefault: false,
};

export default function AddressesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Fetch addresses
  const { data, isLoading, refetch } = useGetQuery<{ addresses: Address[] }>({
    url: "/address",
    queryKey: "addresses",
    isPublic: false,
  });

  const addresses = data?.addresses || [];

  // Mutations
  const { mutate: createAddress, isLoading: isCreating } = useQueryMutation({
    url: "/address",
  });

  const { mutate: updateAddress, isLoading: isUpdating } = useQueryMutation({
    url: "/address",
    method: "PUT",
  });

  const { mutate: deleteAddressMutation, isLoading: isDeleting } =
    useQueryMutation({
      url: "/address",
      method: "DELETE",
    });

  const mapCenter = useMemo((): [number, number] => {
    if (formData.latitude && formData.longitude) {
      return [formData.latitude, formData.longitude];
    }
    return [23.8103, 90.4125]; // Dhaka default
  }, [formData.latitude, formData.longitude]);

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setFormData({
      label: addr.label,
      address: addr.address,
      city: addr.city,
      state: addr.state || "",
      country: addr.country,
      zipcode: addr.zipcode || "",
      latitude: addr.latitude ? parseFloat(addr.latitude) : null,
      longitude: addr.longitude ? parseFloat(addr.longitude) : null,
      isDefault: addr.isDefault,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    setFormData(emptyForm);
  };

  const handleLocationSelect = (
    lat: number,
    lng: number,
    addressData: {
      address: string;
      city: string;
      state: string;
      country: string;
      zipcode: string;
    },
  ) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: addressData.address || prev.address,
      city: addressData.city || prev.city,
      state: addressData.state || prev.state,
      country: addressData.country || prev.country,
      zipcode: addressData.zipcode || prev.zipcode,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.address || !formData.city || !formData.country) {
      toast.error("Please fill in address, city, and country.");
      return;
    }

    const payload = {
      ...formData,
      latitude: formData.latitude ?? undefined,
      longitude: formData.longitude ?? undefined,
    };

    if (editingAddress) {
      updateAddress(
        { ...payload, updatedUrl: `/address/${editingAddress.id}` },
        {
          onSuccess: () => {
            toast.success("Address updated!");
            getQueryClient().invalidateQueries({ queryKey: ["addresses"] });
            closeModal();
          },
        },
      );
    } else {
      createAddress(payload, {
        onSuccess: () => {
          toast.success("Address added!");
          getQueryClient().invalidateQueries({ queryKey: ["addresses"] });
          closeModal();
        },
      });
    }
  };

  const handleDelete = (addressId: number) => {
    deleteAddressMutation(
      { updatedUrl: `/address/${addressId}` },
      {
        onSuccess: () => {
          toast.success("Address deleted!");
          getQueryClient().invalidateQueries({ queryKey: ["addresses"] });
          setDeleteConfirmId(null);
        },
      },
    );
  };

  const handleSetDefault = (addr: Address) => {
    updateAddress(
      { isDefault: true, updatedUrl: `/address/${addr.id}` },
      {
        onSuccess: () => {
          toast.success(`${addr.label} set as default!`);
          getQueryClient().invalidateQueries({ queryKey: ["addresses"] });
        },
      },
    );
  };

  const getLabelConfig = (label: string) => {
    return LABEL_OPTIONS.find((opt) => opt.value === label) || LABEL_OPTIONS[2];
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center sm:text-left">
            Saved Addresses
          </h1>
          <p className="text-gray-500 mt-1 font-medium text-center sm:text-left">
            Manage your delivery locations.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} /> Add New Address
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-48" />
                </div>
              </div>
              <div className="h-4 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && addresses.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Navigation size={40} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
            No saved addresses
          </h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Add your first delivery address to make ordering faster and easier.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
          >
            <Plus size={18} /> Add Your First Address
          </button>
        </div>
      )}

      {/* Address Cards */}
      {!isLoading && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => {
            const labelConfig = getLabelConfig(addr.label);
            const LabelIcon = labelConfig.icon;

            return (
              <div
                key={addr.id}
                className={`bg-white rounded-3xl p-6 shadow-sm border transition-all hover:shadow-md ${
                  addr.isDefault
                    ? "border-red-500 ring-4 ring-red-50"
                    : "border-gray-100 hover:border-gray-300"
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        addr.isDefault
                          ? "bg-red-100 text-red-600"
                          : `${labelConfig.bg} ${labelConfig.color}`
                      }`}
                    >
                      <LabelIcon size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {addr.label}
                        {addr.isDefault && (
                          <span className="bg-red-600 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md">
                            Default
                          </span>
                        )}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {addr.city}
                        {addr.country ? `, ${addr.country}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    {deleteConfirmId === addr.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(addr.id)}
                          disabled={isDeleting}
                          className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          title="Confirm delete"
                        >
                          {isDeleting ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Check size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(addr.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Address Details */}
                <div className="mb-4">
                  <p className="text-gray-600 leading-relaxed flex items-start gap-2">
                    <MapPin
                      size={18}
                      className="text-gray-400 flex-shrink-0 mt-0.5"
                    />
                    <span>{addr.address}</span>
                  </p>
                  {addr.zipcode && (
                    <p className="text-sm text-gray-400 mt-1 ml-[26px]">
                      ZIP: {addr.zipcode}
                    </p>
                  )}
                </div>

                {/* Coordinates Badge */}
                {addr.latitude && addr.longitude && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg font-mono">
                      <Navigation size={10} />
                      {parseFloat(addr.latitude).toFixed(4)},{" "}
                      {parseFloat(addr.longitude).toFixed(4)}
                    </span>
                  </div>
                )}

                {/* Footer Actions */}
                {!addr.isDefault && (
                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => handleSetDefault(addr)}
                      className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Star size={14} /> Set as Default
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-6 border-b border-gray-100 flex justify-between items-center rounded-t-3xl z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {editingAddress
                    ? "Update your delivery location"
                    : "Set your delivery location on the map or enter manually"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Map */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📍 Pin Your Location
                </label>
                <AddressMapPicker
                  center={mapCenter}
                  onLocationSelect={handleLocationSelect}
                  draggable
                />
              </div>

              {/* Label Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Label
                </label>
                <div className="flex gap-3">
                  {LABEL_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = formData.label === opt.value;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            label: opt.value,
                          }))
                        }
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                          isSelected
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Icon size={18} />
                        {opt.value}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Enter your full street address..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-gray-50 focus:bg-white resize-none h-20 font-medium"
                  required
                />
              </div>

              {/* City + State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="City"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-gray-50 focus:bg-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State / Division
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    placeholder="State / Division"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-gray-50 focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* Country + Zipcode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    placeholder="Country"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-gray-50 focus:bg-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipcode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        zipcode: e.target.value,
                      }))
                    }
                    placeholder="ZIP / Postal Code"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-gray-50 focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* Coordinates (read-only) */}
              {formData.latitude && formData.longitude && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                  <Navigation size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Location pinned: {formData.latitude.toFixed(6)},{" "}
                    {formData.longitude.toFixed(6)}
                  </span>
                </div>
              )}

              {/* Set as Default */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Set as Default
                  </h3>
                  <p className="text-xs text-gray-500">
                    Use this address for all orders by default
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isDefault: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500" />
                </label>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-gray-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-600/30"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {editingAddress ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      {editingAddress ? (
                        <>
                          <Check size={18} /> Update Address
                        </>
                      ) : (
                        <>
                          <Plus size={18} /> Save Address
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
