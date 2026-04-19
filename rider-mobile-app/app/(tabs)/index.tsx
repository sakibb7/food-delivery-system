import { View, Text, TouchableOpacity, Switch, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrderStore } from "@/stores/useOrderStore";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import { privateInstance } from "@/configs/axiosConfig";
import { showToast } from "@/app/utils/toast";

export default function HomeScreen() {
  const router = useRouter();
  const { riderProfile, updateOnlineStatus } = useAuthStore();
  const { setActiveOrder } = useOrderStore();
  const [isOnline, setIsOnline] = useState(riderProfile?.isOnline ?? false);
  const [toggling, setToggling] = useState(false);

  // Fetch earnings for today's summary
  const { data: earningsData, refetch: refetchEarnings } = useGetQuery<any>({
    url: "/rider/earnings",
    queryKey: "rider-earnings",
  });

  // Fetch available orders when online
  const { data: availableOrders, refetch: refetchOrders } = useGetQuery<any[]>({
    url: "/rider/orders/available",
    queryKey: "available-orders",
    enabled: isOnline,
  });

  // Poll for available orders when online
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      refetchOrders();
    }, 15000);
    return () => clearInterval(interval);
  }, [isOnline]);

  const handleToggleOnline = async (value: boolean) => {
    setToggling(true);
    try {
      await privateInstance.patch("/rider/online", { isOnline: value });
      setIsOnline(value);
      updateOnlineStatus(value);
      showToast({
        text: value ? "You are now online!" : "You are now offline",
        type: value ? "success" : "info",
      });
      if (value) {
        refetchOrders();
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update status";
      showToast({ text: message, type: "error" });
    } finally {
      setToggling(false);
    }
  };

  const handleAcceptOrder = (order: any) => {
    setActiveOrder(order);
    router.push("/delivery/incoming-order");
  };

  const totalEarnings = earningsData?.totalEarnings ?? 0;
  const totalDeliveries = earningsData?.deliveries ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header / Status Toggle */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10 shadow-sm">
        <View className="flex-row items-center">
          <View className={`w-3 h-3 rounded-full mr-2 ${isOnline ? "bg-emerald-500" : "bg-gray-400"}`} />
          <Text className="text-lg font-bold text-gray-900">
            {isOnline ? "Online" : "Offline"}
          </Text>
          {toggling && <ActivityIndicator size="small" color="#10b981" className="ml-2" />}
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Ionicons name="person-circle-outline" size={28} color="#374151" />
          </TouchableOpacity>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: "#d1d5db", true: "#a7f3d0" }}
            thumbColor={isOnline ? "#10b981" : "#f3f4f6"}
            disabled={toggling}
          />
        </View>
      </View>

      {/* Map Placeholder / Available Orders Area */}
      <View className="flex-1 bg-gray-100 relative">
        {!isOnline ? (
          <View className="flex-1 items-center justify-center p-6">
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-center">
              <Ionicons name="moon-outline" size={48} color="#9ca3af" />
              <Text className="text-xl font-bold text-gray-900 mb-2 mt-4">You are Offline</Text>
              <Text className="text-gray-500 text-center">
                Go online to start receiving delivery requests.
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-1 p-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Available Orders ({availableOrders?.length ?? 0})
            </Text>

            {(!availableOrders || availableOrders.length === 0) ? (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="search-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 mt-4 font-medium text-center">
                  No orders available right now.{"\n"}We'll notify you when one comes in.
                </Text>
              </View>
            ) : (
              availableOrders.map((order: any) => (
                <TouchableOpacity
                  key={order.id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3"
                  onPress={() => handleAcceptOrder(order)}
                >
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-lg font-bold text-gray-900">
                      {order.restaurantName || "Restaurant"}
                    </Text>
                    <Text className="text-emerald-600 font-bold text-lg">
                      ${Number(order.deliveryFee || 5).toFixed(2)}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-sm mb-2" numberOfLines={1}>
                    {order.deliveryAddress}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="restaurant-outline" size={14} color="#6b7280" />
                    <Text className="text-gray-500 text-sm ml-1">Ready for pickup</Text>
                    <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                    <Text className="text-emerald-600 font-medium text-sm">Tap to view</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>

      {/* Bottom Summary Sheet */}
      <View className="bg-white rounded-t-3xl shadow-lg px-6 pt-6 pb-8 border-t border-gray-100">
        <Text className="text-lg font-bold text-gray-900 mb-4">Today's Summary</Text>
        <View className="flex-row justify-between">
          <View className="bg-gray-50 flex-1 p-4 rounded-2xl mr-2 items-center">
            <Text className="text-gray-500 text-sm mb-1">Earnings</Text>
            <Text className="text-2xl font-bold text-emerald-600">
              ${Number(totalEarnings).toFixed(2)}
            </Text>
          </View>
          <View className="bg-gray-50 flex-1 p-4 rounded-2xl ml-2 items-center">
            <Text className="text-gray-500 text-sm mb-1">Deliveries</Text>
            <Text className="text-2xl font-bold text-gray-900">{totalDeliveries}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
