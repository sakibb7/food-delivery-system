import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";

export default function RiderReviewsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: reviewsData, isLoading } = useGetQuery<any>({
    url: `/review/rider/${user?.id}`,
    queryKey: `rider-reviews-${user?.id}`,
    enabled: !!user?.id,
  });

  const reviews = reviewsData?.reviews || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">My Reviews</Text>
        <View className="w-8" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          {reviews.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="star-outline" size={64} color="#d1d5db" className="mb-4" />
              <Text className="text-lg font-bold text-gray-900 mb-2">No reviews yet</Text>
              <Text className="text-gray-500 text-center">
                Keep providing great service to get reviews from customers.
              </Text>
            </View>
          ) : (
            <View className="space-y-4 mb-8">
              {reviews.map((review: any) => (
                <View key={review.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mr-3">
                        <Text className="text-emerald-700 font-bold text-lg">
                          {review.userName?.charAt(0) || "U"}
                        </Text>
                      </View>
                      <View>
                        <Text className="font-bold text-gray-900">{review.userName}</Text>
                        <Text className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
                      <Ionicons name="star" size={14} color="#fbbf24" />
                      <Text className="text-yellow-700 font-bold ml-1">{review.rating}</Text>
                    </View>
                  </View>
                  {review.comment && (
                    <Text className="text-gray-700 mt-2 italic">"{review.comment}"</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
