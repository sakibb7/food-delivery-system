import React, { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { privateInstance } from "@/configs/axiosConfig";
import { toast } from "sonner";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  restaurantId: number;
  riderId: number | null;
  hasRestaurantReview: boolean;
  hasRiderReview: boolean;
  onSuccess: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  orderId,
  restaurantId,
  riderId,
  hasRestaurantReview,
  hasRiderReview,
  onSuccess,
}: ReviewModalProps) {
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [restaurantComment, setRestaurantComment] = useState("");
  const [riderRating, setRiderRating] = useState(0);
  const [riderComment, setRiderComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!hasRestaurantReview && restaurantRating === 0) {
      toast.error("Please provide a rating for the restaurant");
      return;
    }

    if (riderId && !hasRiderReview && riderRating === 0) {
      toast.error("Please provide a rating for the rider");
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit Restaurant Review
      if (!hasRestaurantReview) {
        await privateInstance.post("/review/restaurant", {
          orderId,
          restaurantId,
          rating: restaurantRating,
          comment: restaurantComment || undefined,
        });
      }

      // Submit Rider Review if rider exists and not yet reviewed
      if (riderId && !hasRiderReview) {
        await privateInstance.post("/review/rider", {
          orderId,
          riderId,
          rating: riderRating,
          comment: riderComment || undefined,
        });
      }

      toast.success("Thank you for your feedback!");
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to submit review";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingStars = ({
    rating,
    setRating,
  }: {
    rating: number;
    setRating: (r: number) => void;
  }) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              size={32}
              className={`${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Leave a Review
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
            {/* Restaurant Review */}
            {!hasRestaurantReview && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">
                  How was the food?
                </h3>
                <RatingStars
                  rating={restaurantRating}
                  setRating={setRestaurantRating}
                />
                <textarea
                  placeholder="Tell us what you liked or didn't like..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none h-24"
                  value={restaurantComment}
                  onChange={(e) => setRestaurantComment(e.target.value)}
                />
              </div>
            )}

            {/* Rider Review */}
            {riderId && !hasRiderReview && (
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">
                  How was your delivery?
                </h3>
                <RatingStars rating={riderRating} setRating={setRiderRating} />
                <textarea
                  placeholder="How was the delivery experience?"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none h-24"
                  value={riderComment}
                  onChange={(e) => setRiderComment(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
