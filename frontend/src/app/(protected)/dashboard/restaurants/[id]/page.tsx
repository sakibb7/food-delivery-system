"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Plus,
  Edit2,
  Trash2,
  UtensilsCrossed,
  Eye,
  EyeOff,
  ChefHat,
  TrendingUp,
  ShoppingBag,
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { useCurrency } from "@/hooks/useCurrency";
import Button from "@/components/ui/button";
import AddMenuItemModal from "@/components/modals/AddMenuItemModal";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description: string;
  cuisine: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  phone: string;
  email: string;
  coverImage: string;
  logo: string;
  rating: string;
  totalReviews: number;
  deliveryTime: string;
  deliveryFee: string;
  minOrderAmount: string;
  isActive: boolean;
  isOpen: boolean;
}

interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  isAvailable: boolean;
  sortOrder: number;
}

export default function RestaurantDetailsPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const { currencySymbol } = useCurrency();

  const { data: restaurantData, isLoading: isLoadingRestaurant } = useGetQuery({
    url: `/restaurant/${restaurantId}`,
  });

  const { data: menuData, isLoading: isLoadingMenu } = useGetQuery({
    url: `/menu/${restaurantId}`,
    queryKey: ["menu", restaurantId],
  });

  const { mutate: deleteItem } = useQueryMutation({
    url: `/menu/${restaurantId}`,
    method: "DELETE",
  });

  const restaurant: Restaurant | null = restaurantData?.restaurant || null;
  const menuItems: MenuItem[] = menuData?.menuItems || [];

  // Group menu items by category
  const groupedItems = menuItems.reduce(
    (acc: Record<string, MenuItem[]>, item) => {
      const cat = item.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {}
  );

  const handleDeleteItem = (itemId: number) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    deleteItem(
      { updatedUrl: `/menu/${restaurantId}/${itemId}` },
      {
        onSuccess: () => {
          toast.success("Menu item deleted!");
          queryClient.invalidateQueries({ queryKey: ["menu", restaurantId] });
        },
      }
    );
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["menu", restaurantId] });
    handleModalClose();
  };

  if (isLoadingRestaurant) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Restaurant not found
        </h2>
        <Link href="/dashboard/restaurants">
          <Button variant="outline" className="rounded-xl mt-4">
            <ArrowLeft size={18} className="mr-2" />
            Back to My Restaurants
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Back Navigation */}
      <Link
        href="/dashboard/restaurants"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold mb-8 transition-colors group"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to My Restaurants
      </Link>

      {/* Hero Section */}
      <div className="relative rounded-[2.5rem] overflow-hidden mb-10 shadow-xl">
        <div className="relative h-72 md:h-80">
          <Image
            src={
              restaurant.coverImage ||
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60"
            }
            alt={restaurant.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow ${
                    restaurant.isActive
                      ? "bg-green-500/90 text-white"
                      : "bg-yellow-500/90 text-white"
                  }`}
                >
                  {restaurant.isActive ? "Active" : "Pending Approval"}
                </span>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow ${
                    restaurant.isOpen
                      ? "bg-blue-500/90 text-white"
                      : "bg-gray-500/90 text-white"
                  }`}
                >
                  {restaurant.isOpen ? "Open" : "Closed"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {restaurant.name}
              </h1>
              <p className="text-white/70 font-medium mt-1">
                {restaurant.cuisine}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-5 py-3 rounded-2xl">
              <Star size={22} className="text-yellow-400 fill-yellow-400" />
              <span className="text-2xl font-extrabold text-white">
                {restaurant.rating || "0.0"}
              </span>
              <span className="text-white/60 text-sm font-medium ml-1">
                ({restaurant.totalReviews || 0} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          {
            icon: Clock,
            label: "Delivery Time",
            value: `${restaurant.deliveryTime || "25-30"} min`,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            icon: DollarSign,
            label: "Min Order",
            value: `${currencySymbol}${restaurant.minOrderAmount || "0"}`,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            icon: ShoppingBag,
            label: "Delivery Fee",
            value: `${currencySymbol}${restaurant.deliveryFee || "0"}`,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            icon: TrendingUp,
            label: "Menu Items",
            value: menuItems.length.toString(),
            color: "text-red-600",
            bg: "bg-red-50",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}
            >
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-xl font-extrabold text-gray-900 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Description */}
        <div className="md:col-span-2 bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <ChefHat size={20} className="text-red-500" />
            About
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {restaurant.description || "No description provided yet."}
          </p>
        </div>

        {/* Contact & Location */}
        <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Details</h3>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={16} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Address
              </p>
              <p className="text-sm font-medium text-gray-700">
                {restaurant.address}
                {restaurant.city ? `, ${restaurant.city}` : ""}
                {restaurant.country ? `, ${restaurant.country}` : ""}
              </p>
            </div>
          </div>

          {restaurant.phone && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Phone size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Phone
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {restaurant.phone}
                </p>
              </div>
            </div>
          )}

          {restaurant.email && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail size={16} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {restaurant.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Menu Items
            </h2>
            <p className="text-gray-500 font-medium mt-1">
              Manage your restaurant&apos;s food offerings
            </p>
          </div>
          <Button
            onClick={handleAddNew}
            className="rounded-2xl px-6 py-4 text-base font-bold shadow-lg shadow-red-200 hover:shadow-xl transition-all"
          >
            <Plus size={20} className="mr-2" />
            Add Menu Item
          </Button>
        </div>

        {isLoadingMenu ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="bg-white rounded-[2rem] border-2 border-dashed border-gray-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
              <UtensilsCrossed size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No menu items yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
              Start adding your delicious dishes so customers can discover and
              order from your restaurant!
            </p>
            <Button
              onClick={handleAddNew}
              variant="outline"
              className="rounded-2xl px-8 border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold"
            >
              <Plus size={18} className="mr-2" />
              Add Your First Item
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <UtensilsCrossed size={16} className="text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {category}
                  </h3>
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex"
                    >
                      {/* Item Image */}
                      <div className="relative w-32 h-full flex-shrink-0">
                        <Image
                          src={
                            item.image ||
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60"
                          }
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-xs font-bold bg-red-500 px-2 py-1 rounded-full">
                              Unavailable
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 p-5 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {item.description || "No description"}
                            </p>
                          </div>
                          <div className="flex items-center ml-3">
                            {item.isAvailable ? (
                              <span title="Available">
                                <Eye size={16} className="text-green-500" />
                              </span>
                            ) : (
                              <span title="Unavailable">
                                <EyeOff size={16} className="text-gray-400" />
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-3">
                          <span className="text-lg font-extrabold text-red-600">
                            {currencySymbol}{item.price}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2
                                size={16}
                                className="text-gray-500 hover:text-blue-600"
                              />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2
                                size={16}
                                className="text-gray-500 hover:text-red-600"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menu Item Modal */}
      <AddMenuItemModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        restaurantId={restaurantId}
        editItem={editingItem}
      />
    </div>
  );
}
