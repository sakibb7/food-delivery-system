import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import { useCurrency } from "@/hooks/useCurrency";

export default function EarningsScreen() {
  const { currencySymbol } = useCurrency();
  const { data, isLoading, refetch } = useGetQuery<any>({
    url: "/rider/earnings",
    queryKey: "rider-earnings-detail",
  });

  const totalEarnings = data?.totalEarnings ?? 0;
  const deliveries = data?.deliveries ?? 0;
  const history = data?.history ?? [];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-6 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Earnings</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Balance Card */}
          <View className="m-6 bg-emerald-500 p-6 rounded-3xl shadow-sm">
            <Text className="text-emerald-50 text-base mb-1">Total Earnings</Text>
            <Text className="text-white text-4xl font-bold mb-6">
              {currencySymbol}{Number(totalEarnings).toFixed(2)}
            </Text>

            <TouchableOpacity className="bg-white py-3 rounded-xl items-center">
              <Text className="text-emerald-600 font-bold">Cash Out</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Overview</Text>
            <View className="flex-row justify-between bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <View>
                <Text className="text-gray-500 mb-1">Total Earned</Text>
                <Text className="text-xl font-bold text-gray-900">
                  {currencySymbol}{Number(totalEarnings).toFixed(2)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-500 mb-1">Deliveries</Text>
                <Text className="text-xl font-bold text-gray-900">{deliveries}</Text>
              </View>
            </View>
          </View>

          {/* Recent Completed Orders */}
          <View className="px-6 pb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">Completed Deliveries</Text>
              <TouchableOpacity onPress={() => refetch()}>
                <Text className="text-emerald-600 font-medium">Refresh</Text>
              </TouchableOpacity>
            </View>

            {history.length === 0 ? (
              <View className="items-center py-8">
                <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 mt-4">No completed deliveries yet</Text>
              </View>
            ) : (
              history.map((order: any) => (
                <View
                  key={order.id}
                  className="flex-row items-center justify-between py-4 border-b border-gray-100"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mr-3">
                      <Ionicons name="checkmark" size={20} color="#10b981" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-gray-900 mb-1" numberOfLines={1}>
                        {order.restaurantName || "Order #" + order.id}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {order.deliveredAt
                          ? new Date(order.deliveredAt).toLocaleDateString()
                          : "Completed"}
                      </Text>
                    </View>
                  </View>
                  <Text className="font-bold text-emerald-600">
                    +{currencySymbol}{Number(order.riderEarnings || 0).toFixed(2)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
