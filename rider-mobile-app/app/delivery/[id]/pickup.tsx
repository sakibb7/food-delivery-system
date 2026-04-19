import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useOrderStore } from "@/stores/useOrderStore";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import DeliveryMap from "@/components/DeliveryMap";

export default function PickupScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeOrder, setActiveOrder } = useOrderStore();

  // Fetch order details if not in store
  const { data: orderData, isLoading } = useGetQuery<any>({
    url: `/rider/orders/${id}`,
    queryKey: ["order-detail", id],
    enabled: !activeOrder || activeOrder.id !== Number(id),
  });

  const order = activeOrder?.id === Number(id) ? activeOrder : orderData;

  // Parse restaurant coordinates
  const restaurantCoords =
    order?.restaurantLat && order?.restaurantLng
      ? {
          latitude: parseFloat(order.restaurantLat),
          longitude: parseFloat(order.restaurantLng),
        }
      : undefined;

  if (isLoading && !order) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 z-10 bg-white shadow-sm">
        <TouchableOpacity onPress={() => router.push("/(tabs)")} className="p-2">
          <Ionicons name="chevron-down" color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Go to Restaurant</Text>
        <View className="w-10" />
      </View>

      {/* Map — Rider to Restaurant */}
      <DeliveryMap
        restaurantCoords={restaurantCoords}
        showRestaurant={true}
        showCustomer={false}
        showRider={true}
        restaurantName={order?.restaurantName || "Restaurant"}
        enableLocationTracking={true}
      />

      {/* Bottom Sheet Details */}
      <View className="bg-white rounded-t-3xl shadow-lg border-t border-gray-100 p-6">
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {order?.restaurantName || "Restaurant"}
            </Text>
            <Text className="text-gray-500 text-base" numberOfLines={2}>
              {order?.deliveryAddress || "Pickup location"}
            </Text>
          </View>
          <View className="bg-orange-100 px-3 py-1 rounded-full ml-2">
            <Text className="text-orange-700 font-bold text-xs">Heading there</Text>
          </View>
        </View>

        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity className="flex-1 bg-gray-100 py-3 rounded-xl items-center flex-row justify-center">
            <Ionicons name="call" size={18} color="#374151" />
            <Text className="font-bold text-gray-700 ml-2">Call Rest.</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-gray-100 py-3 rounded-xl items-center flex-row justify-center">
            <Ionicons name="navigate" size={18} color="#374151" />
            <Text className="font-bold text-gray-700 ml-2">Directions</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="w-full bg-emerald-500 py-4 rounded-xl items-center"
          onPress={() => router.push(`/delivery/${id}/confirm-pickup`)}
        >
          <Text className="text-white font-bold text-lg">Arrived at Restaurant</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
