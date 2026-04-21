import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useOrderStore } from "@/stores/useOrderStore";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import { privateInstance } from "@/configs/axiosConfig";
import { showToast } from "@/utils/toast";

export default function ConfirmPickupScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeOrder, setActiveOrder } = useOrderStore();
  const [confirming, setConfirming] = useState(false);

  // Fetch order details with items
  const { data: orderData, isLoading } = useGetQuery<any>({
    url: `/rider/orders/${id}`,
    queryKey: ["order-detail-items", id],
  });

  const order = orderData || activeOrder;
  const items = orderData?.items || [];

  const [itemsChecked, setItemsChecked] = useState<boolean[]>([]);

  useEffect(() => {
    if (items.length > 0 && itemsChecked.length !== items.length) {
      setItemsChecked(new Array(items.length).fill(false));
    }
  }, [items.length]);

  const allChecked = itemsChecked.length > 0 && itemsChecked.every(Boolean);

  const toggleCheck = (index: number) => {
    const newItems = [...itemsChecked];
    newItems[index] = !newItems[index];
    setItemsChecked(newItems);
  };

  const handleConfirmPickup = async () => {
    setConfirming(true);
    try {
      const res = await privateInstance.patch(`/rider/orders/${id}/pickup`);
      const updatedOrder = res.data?.data;
      if (updatedOrder && activeOrder) {
        setActiveOrder({ ...activeOrder, ...updatedOrder });
      }
      showToast({ text: "Order picked up!", type: "success" });
      router.replace(`/delivery/${id}/dropoff`);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to confirm pickup";
      showToast({ text: message, type: "error" });
    } finally {
      setConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-2">Confirm Order Pickup</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <Text className="text-gray-500 mb-1">Order Number</Text>
          <Text className="text-3xl font-bold text-gray-900">#{id}</Text>
          {order?.restaurantName && (
            <Text className="text-gray-500 mt-1">{order.restaurantName}</Text>
          )}
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          Order Items ({items.length})
        </Text>

        {items.length === 0 ? (
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 items-center">
            <Ionicons name="restaurant-outline" size={32} color="#9ca3af" />
            <Text className="text-gray-500 mt-2">No item details available</Text>
            <Text className="text-gray-400 text-sm">Verify with the restaurant directly</Text>
          </View>
        ) : (
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            {items.map((item: any, index: number) => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center p-4 ${index < items.length - 1 ? "border-b border-gray-50" : ""}`}
                onPress={() => toggleCheck(index)}
              >
                <View
                  className={`w-6 h-6 rounded border ${
                    itemsChecked[index]
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-gray-300"
                  } items-center justify-center mr-4`}
                >
                  {itemsChecked[index] && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 text-lg">
                    {item.quantity}x {item.name}
                  </Text>
                  <Text className="text-gray-500">
                    ${Number(item.price).toFixed(2)} each
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View className="p-6 bg-white border-t border-gray-100">
        <TouchableOpacity
          className={`w-full py-4 rounded-xl items-center ${
            allChecked || items.length === 0
              ? confirming
                ? "bg-emerald-400"
                : "bg-emerald-500"
              : "bg-gray-300"
          }`}
          disabled={items.length > 0 ? !allChecked || confirming : confirming}
          onPress={handleConfirmPickup}
        >
          {confirming ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Confirm Pickup</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
