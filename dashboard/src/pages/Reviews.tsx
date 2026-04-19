import React, { useEffect, useState, useContext } from "react";
import { Star, MessageSquare } from "lucide-react";
import { privateInstance } from "../configs/axiosConfig";
import { AppContext } from "../context/app-context";
import { AppContextType } from "../types";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName: string;
  userAvatar: string | null;
}

export default function Reviews() {
  const { user } = useContext(AppContext) as AppContextType;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantStats, setRestaurantStats] = useState({ rating: "0", totalReviews: 0 });

  useEffect(() => {
    // Determine which restaurant this owner manages.
    // In a real app with multiple restaurants, you might select one,
    // but here we just get the first restaurant they own.
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Step 1: Get the owner's restaurant(s)
        const myRestaurantsRes = await privateInstance.get("/restaurant/owner/my-restaurants");
        const restaurants = myRestaurantsRes.data.restaurants || [];
        
        if (restaurants.length > 0) {
          const mainRestaurant = restaurants[0];
          setRestaurantStats({
            rating: mainRestaurant.rating || "0",
            totalReviews: mainRestaurant.totalReviews || 0
          });

          // Step 2: Fetch reviews for this restaurant
          const reviewsRes = await privateInstance.get(`/review/restaurant/${mainRestaurant.id}`);
          setReviews(reviewsRes.data.reviews || []);
        }
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "restaurant" || user?.role === "admin") {
      fetchReviews();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
          <div className="text-4xl font-extrabold text-gray-900 mb-2">
            {parseFloat(restaurantStats.rating).toFixed(1)}
          </div>
          <div className="flex text-yellow-400 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={20} className={s <= parseFloat(restaurantStats.rating) ? "fill-yellow-400" : "text-gray-300"} />
            ))}
          </div>
          <p className="text-sm text-gray-500 font-medium">Average Rating</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
          <div className="text-4xl font-extrabold text-gray-900 mb-2">
            {restaurantStats.totalReviews}
          </div>
          <div className="text-blue-500 mb-2">
            <MessageSquare size={24} />
          </div>
          <p className="text-sm text-gray-500 font-medium">Total Reviews</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">Recent Feedback</h2>
        </div>
        
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No reviews yet. Keep providing great service!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{review.userName}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-yellow-700 text-sm">{review.rating}</span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-700 ml-13 pl-13">
                    "{review.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
