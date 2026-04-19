"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  ChevronRight,
  Loader2,
  Bike,
  UtensilsCrossed,
} from "lucide-react";
import { publicInstance } from "@/configs/axiosConfig";
import { useCartStore } from "@/store/cart";

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string | null;
  address: string;
  city: string;
  cuisine: string | null;
  deliveryTime: string | null;
  deliveryFee: string | null;
  minOrderAmount: string | null;
  rating: string | null;
  totalReviews: number | null;
  isOpen: boolean | null;
}

interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  image: string | null;
  isAvailable: boolean | null;
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName: string;
  userAvatar: string | null;
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const cart = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [restaurantRes, menuRes, reviewsRes] = await Promise.all([
          publicInstance.get(`/restaurant/${id}`),
          publicInstance.get(`/menu/${id}`),
          publicInstance.get(`/review/restaurant/${id}`).catch(() => ({ data: { reviews: [] } })),
        ]);

        setRestaurant(restaurantRes.data.restaurant);
        setMenuItems(menuRes.data.menuItems || []);
        setReviews(reviewsRes.data.reviews || []);

        // Set initial active category
        const items = menuRes.data.menuItems || [];
        if (items.length > 0) {
          const firstCat = items[0].category || "Other";
          setActiveCategory(firstCat);
        }
      } catch (err) {
        setError("Failed to load restaurant");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Group menu items by category
  const groupedMenu = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    menuItems.forEach((item) => {
      const cat = item.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [menuItems]);

  const categories = Object.keys(groupedMenu);

  const scrollToCategory = (cat: string) => {
    setActiveCategory(cat);
    const el = categoryRefs.current[cat];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getItemQuantity = (menuItemId: number) => {
    const item = cart.items.find((i) => i.menuItemId === menuItemId);
    return item?.quantity || 0;
  };

  const handleAddItem = (item: MenuItem) => {
    if (!restaurant) return;
    cart.addItem({
      menuItemId: item.id,
      name: item.name,
      price: parseFloat(item.price),
      image: item.image,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
    });
  };

  const totalItems = cart.getTotalItems();
  const subtotal = cart.getSubtotal();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-red-500" size={48} />
          <p className="text-gray-500 font-medium">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-2">
            Restaurant not found
          </p>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/restaurants"
            className="bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-all"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero / Cover */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
        {restaurant.coverImage && (
          <Image
            src={restaurant.coverImage}
            alt={restaurant.name}
            fill
            className="object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-white/15 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium hover:bg-white/25 transition-all"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-5xl mx-auto flex items-end gap-5">
            {restaurant.logo ? (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white shadow-xl overflow-hidden flex-shrink-0 border-4 border-white">
                <Image
                  src={restaurant.logo}
                  alt={restaurant.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white shadow-xl flex-shrink-0 border-4 border-white flex items-center justify-center">
                <UtensilsCrossed className="text-red-500" size={36} />
              </div>
            )}

            <div className="flex-1 text-white">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1 drop-shadow-lg">
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm md:text-base text-white/80">
                {restaurant.cuisine && (
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-0.5 rounded-full">
                    {restaurant.cuisine}
                  </span>
                )}
                {restaurant.rating && parseFloat(restaurant.rating) > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={14} fill="currentColor" className="text-yellow-400" />
                    {parseFloat(restaurant.rating).toFixed(1)}
                    {restaurant.totalReviews
                      ? ` (${restaurant.totalReviews})`
                      : ""}
                  </span>
                )}
                {restaurant.deliveryTime && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {restaurant.deliveryTime}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex flex-wrap gap-6 text-sm text-gray-600 font-medium">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-red-500" />
            <span>
              {restaurant.address}, {restaurant.city}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Bike size={16} className="text-red-500" />
            <span>
              Delivery Fee: ৳
              {parseFloat(restaurant.deliveryFee || "0").toFixed(0)}
            </span>
          </div>
          {restaurant.minOrderAmount &&
            parseFloat(restaurant.minOrderAmount) > 0 && (
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-red-500" />
                <span>
                  Min. Order: ৳
                  {parseFloat(restaurant.minOrderAmount).toFixed(0)}
                </span>
              </div>
            )}
          {restaurant.isOpen === false && (
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-xs">
              Currently Closed
            </span>
          )}
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {menuItems.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <UtensilsCrossed className="mx-auto mb-4" size={48} />
            <p className="text-xl font-bold text-gray-900 mb-2">
              No menu items yet
            </p>
            <p>This restaurant hasn&apos;t added their menu yet.</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Category Tabs (Sidebar on Desktop, Horizontal Scroll on Mobile) */}
            {categories.length > 1 && (
              <div className="lg:w-52 flex-shrink-0">
                <div className="lg:sticky lg:top-20">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3 hidden lg:block">
                    Categories
                  </h3>
                  <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => scrollToCategory(cat)}
                        className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          activeCategory === cat
                            ? "bg-red-600 text-white shadow-md shadow-red-200"
                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items Grid */}
            <div className="flex-1 space-y-10">
              {categories.map((cat) => (
                <div
                  key={cat}
                  ref={(el) => {
                    categoryRefs.current[cat] = el;
                  }}
                  className="scroll-mt-20"
                >
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-red-500 rounded-full" />
                    {cat}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedMenu[cat].map((item) => {
                      const qty = getItemQuantity(item.id);
                      const isUnavailable = item.isAvailable === false;

                      return (
                        <div
                          key={item.id}
                          className={`bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-lg transition-all group ${
                            isUnavailable ? "opacity-50" : ""
                          }`}
                        >
                          {/* Item Image */}
                          {item.image ? (
                            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          ) : (
                            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 flex-shrink-0 flex items-center justify-center">
                              <UtensilsCrossed
                                size={28}
                                className="text-red-300"
                              />
                            </div>
                          )}

                          {/* Item Info */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <h3 className="font-bold text-gray-900 line-clamp-1">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                                {item.description}
                              </p>
                            )}
                            <div className="mt-auto pt-2 flex items-center justify-between">
                              <span className="font-extrabold text-gray-900 text-lg">
                                ৳{parseFloat(item.price).toFixed(0)}
                              </span>

                              {isUnavailable ? (
                                <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">
                                  Unavailable
                                </span>
                              ) : qty > 0 ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      cart.updateQuantity(
                                        item.id,
                                        qty - 1
                                      )
                                    }
                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="font-bold text-gray-900 w-5 text-center">
                                    {qty}
                                  </span>
                                  <button
                                    onClick={() =>
                                      cart.updateQuantity(
                                        item.id,
                                        qty + 1
                                      )
                                    }
                                    className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-colors"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAddItem(item)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm px-4 py-2 rounded-xl transition-all hover:shadow-sm"
                                >
                                  Add +
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 mb-20 border-t border-gray-100">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
            <Star className="text-yellow-400 fill-yellow-400" size={28} />
            Customer Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                    {review.userAvatar ? (
                      <Image src={review.userAvatar} alt={review.userName} width={48} height={48} className="object-cover" />
                    ) : (
                      <span className="font-bold text-gray-400">{review.userName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{review.userName}</h4>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-yellow-700 text-sm">{review.rating.toFixed(1)}</span>
                  </div>
                </div>
                {review.comment && <p className="text-gray-600 italic leading-relaxed flex-1">"{review.comment}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Cart Bar */}
      {totalItems > 0 && cart.restaurantId === restaurant.id && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
          <div className="max-w-2xl mx-auto">
            <Link href="/checkout">
              <div className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl shadow-red-600/30 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 px-3 py-1 rounded-lg font-bold">
                    {totalItems}
                  </div>
                  <span className="font-bold text-lg">View Cart</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg">
                    ৳{subtotal.toFixed(0)}
                  </span>
                  <ChevronRight size={20} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
