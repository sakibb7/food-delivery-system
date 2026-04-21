import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useOrderStore } from "@/stores/useOrderStore";
import { privateInstance } from "@/configs/axiosConfig";
import { showToast } from "@/utils/toast";

export default function IncomingOrderScreen() {
  const router = useRouter();
  const { activeOrder, setActiveOrder, clearActiveOrder } = useOrderStore();
  const [timeLeft, setTimeLeft] = useState(30);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (timeLeft === 0) {
      clearActiveOrder();
      router.back();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAccept = async () => {
    if (!activeOrder) return;
    setAccepting(true);
    try {
      const res = await privateInstance.patch(`/rider/orders/${activeOrder.id}/accept`);
      const updatedOrder = res.data?.data;
      if (updatedOrder) {
        // Merge the full order detail (includes restaurant and delivery coordinates)
        setActiveOrder({ ...activeOrder, ...updatedOrder });
      }
      showToast({ text: "Order accepted!", type: "success" });
      router.replace(`/delivery/${activeOrder.id}/pickup`);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to accept order";
      showToast({ text: message, type: "error" });
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    clearActiveOrder();
    router.back();
  };

  if (!activeOrder) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white text-lg">No order data available</Text>
        <TouchableOpacity className="mt-4 bg-white py-3 px-6 rounded-xl" onPress={() => router.back()}>
          <Text className="font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center p-6">
      <View className="bg-white rounded-3xl w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Progress Bar Background */}
        <View
          className="absolute top-0 left-0 bottom-0 bg-emerald-50 opacity-50"
          style={{ width: `${(timeLeft / 30) * 100}%` }}
        />

        <View className="items-center mb-6">
          <View className="bg-emerald-100 px-4 py-2 rounded-full mb-4 flex-row items-center">
            <Ionicons name="timer-outline" size={16} color="#059669" />
            <Text className="text-emerald-700 font-bold ml-2">
              00:{timeLeft.toString().padStart(2, "0")}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center">New Delivery Request</Text>
        </View>

        <View className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="restaurant" size={20} color="#ea580c" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-gray-900 text-lg">
                {activeOrder.restaurantName || "Restaurant"}
              </Text>
              <Text className="text-gray-500">Pickup location</Text>
            </View>
          </View>

          <View className="flex-row items-center border-t border-gray-200 pt-4 mt-2">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="location" size={20} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-gray-900 text-lg">Customer Dropoff</Text>
              <Text className="text-gray-500" numberOfLines={1}>
                {activeOrder.deliveryAddress}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-8 px-4">
          <View>
            <Text className="text-gray-500 mb-1">Estimated Earnings</Text>
            <Text className="text-3xl font-bold text-emerald-600">
              ${Number(activeOrder.deliveryFee || 5).toFixed(2)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-500 mb-1">Order Total</Text>
            <Text className="text-2xl font-bold text-gray-900">
              ${Number(activeOrder.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-4">
          <TouchableOpacity
            className="flex-1 bg-red-50 py-4 rounded-xl items-center border border-red-200"
            onPress={handleDecline}
            disabled={accepting}
          >
            <Text className="text-red-600 font-bold text-lg">Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-4 rounded-xl items-center shadow-sm ${accepting ? "bg-emerald-400" : "bg-emerald-500"}`}
            onPress={handleAccept}
            disabled={accepting}
          >
            {accepting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Accept</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
