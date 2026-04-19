import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useOrderStore } from "@/stores/useOrderStore";
import { getQueryClient } from "@/configs/query-client";

export default function DeliverySuccessScreen() {
  const router = useRouter();
  const { activeOrder, clearActiveOrder } = useOrderStore();

  const handleBackToHome = () => {
    // Invalidate earnings and history queries so they refetch
    const queryClient = getQueryClient();
    queryClient.invalidateQueries({ queryKey: ["rider-earnings"] });
    queryClient.invalidateQueries({ queryKey: ["rider-earnings-detail"] });
    queryClient.invalidateQueries({ queryKey: ["rider-history"] });
    queryClient.invalidateQueries({ queryKey: ["available-orders"] });
    clearActiveOrder();
    router.replace("/(tabs)");
  };

  const earnings = Number(activeOrder?.riderEarnings || 0).toFixed(2);

  return (
    <SafeAreaView className="flex-1 bg-emerald-500 justify-center items-center p-6">
      <View className="bg-white rounded-3xl w-full p-8 shadow-2xl items-center">
        <View className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-done" size={48} color="#10b981" />
        </View>

        <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
          Delivery Complete!
        </Text>
        <Text className="text-gray-500 text-center mb-8">
          Great job! You've successfully delivered the order.
        </Text>

        <View className="w-full border-t border-b border-gray-100 py-6 mb-8 flex-row justify-between">
          <View>
            <Text className="text-gray-500 mb-1">Earned</Text>
            <Text className="text-3xl font-bold text-emerald-600">${earnings}</Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-500 mb-1">Restaurant</Text>
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              {activeOrder?.restaurantName || "—"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="w-full bg-gray-900 py-4 rounded-xl items-center"
          onPress={handleBackToHome}
        >
          <Text className="text-white font-bold text-lg">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
