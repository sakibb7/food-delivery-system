import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useOrderStore } from "@/stores/useOrderStore";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import { privateInstance } from "@/configs/axiosConfig";
import { showToast } from "@/utils/toast";
import DeliveryMap from "@/components/DeliveryMap";
import { useCurrency } from "@/hooks/useCurrency";

export default function DropoffScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeOrder, setActiveOrder } = useOrderStore();
  const [delivering, setDelivering] = useState(false);
  const { currencySymbol } = useCurrency();

  // Fetch order details if not in store
  const { data: orderData } = useGetQuery<any>({
    url: `/rider/orders/${id}`,
    queryKey: ["order-dropoff", id],
    enabled: !activeOrder || activeOrder.id !== Number(id),
  });

  const order = activeOrder?.id === Number(id) ? activeOrder : orderData;
  const isCOD = order?.paymentMethod === "cod";

  // Use real delivery coordinates from the order
  const customerCoords =
    order?.deliveryLat && order?.deliveryLng
      ? {
          latitude: parseFloat(order.deliveryLat),
          longitude: parseFloat(order.deliveryLng),
        }
      : undefined;

  const handleCall = () => {
    if (order?.deliveryPhone) {
      Linking.openURL(`tel:${order.deliveryPhone}`);
    }
  };

  const handleDirections = () => {
    if (customerCoords) {
      const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
      const latLng = `${customerCoords.latitude},${customerCoords.longitude}`;
      const label = "Customer";
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
      });

      if (url) Linking.openURL(url);
    }
  };

  const confirmDelivery = () => {
    const title = isCOD ? "Collect Cash" : "Confirm Delivery";
    const message = isCOD 
      ? `Please collect ${currencySymbol}${Number(order?.total).toFixed(2)} from the customer before completing.` 
      : "Are you sure you have delivered the order?";

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Complete", style: "default", onPress: handleDeliver },
    ]);
  };

  const handleDeliver = async () => {
    setDelivering(true);
    try {
      const res = await privateInstance.patch(`/rider/orders/${id}/deliver`);
      const updatedOrder = res.data?.data;
      if (updatedOrder && activeOrder) {
        setActiveOrder({ ...activeOrder, ...updatedOrder, status: "delivered" });
      }
      showToast({ text: "Order delivered successfully!", type: "success" });
      router.replace("/delivery/success");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to mark as delivered";
      showToast({ text: message, type: "error" });
    } finally {
      setDelivering(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 z-10 bg-white shadow-sm">
        <TouchableOpacity onPress={() => router.push("/(tabs)")} className="p-2">
          <Ionicons name="chevron-down" color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Deliver to Customer</Text>
        <View className="bg-red-100 px-3 py-1 rounded-full">
          <Text className="text-red-700 font-bold text-xs">SOS</Text>
        </View>
      </View>

      {/* Map — Rider to Customer */}
      <DeliveryMap
        customerCoords={customerCoords}
        showRestaurant={false}
        showCustomer={true}
        showRider={true}
        customerLabel="Customer"
        enableLocationTracking={true}
      />

      {/* Bottom Sheet Details */}
      <View className="bg-white rounded-t-3xl shadow-lg border-t border-gray-100 p-6">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 bg-gray-200 rounded-full mr-3 items-center justify-center">
              <Ionicons name="person" size={24} color="#9ca3af" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">Customer</Text>
              <Text className="text-gray-500" numberOfLines={1}>
                {order?.deliveryAddress || "Delivery address"}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity 
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              onPress={handleDirections}
            >
              <Ionicons name="navigate" size={18} color="#374151" />
            </TouchableOpacity>
            {order?.deliveryPhone && (
              <TouchableOpacity 
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                onPress={handleCall}
              >
                <Ionicons name="call" size={18} color="#374151" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isCOD && (
          <View className="bg-orange-50 p-4 rounded-xl border border-orange-200 mb-4 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="cash" size={20} color="#ea580c" />
              <Text className="text-orange-800 font-bold ml-2">Collect Cash</Text>
            </View>
            <Text className="text-xl font-bold text-orange-700">
              {currencySymbol}{Number(order?.total).toFixed(2)}
            </Text>
          </View>
        )}

        {order?.notes && (
          <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6">
            <View className="flex-row items-center mb-1">
              <Ionicons name="information-circle" size={16} color="#ca8a04" />
              <Text className="text-yellow-800 font-bold ml-1">Delivery Instructions</Text>
            </View>
            <Text className="text-yellow-800">"{order.notes}"</Text>
          </View>
        )}

        <TouchableOpacity
          className={`w-full py-4 rounded-xl items-center ${delivering ? "bg-emerald-400" : "bg-emerald-500"}`}
          onPress={confirmDelivery}
          disabled={delivering}
        >
          {delivering ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Complete Delivery</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
