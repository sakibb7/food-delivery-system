import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function HistoryScreen() {
  const { data: history, isLoading, refetch } = useGetQuery<any[]>({
    url: "/rider/history",
    queryKey: "rider-history",
  });

  const renderItem = ({ item }: any) => (
    <TouchableOpacity className="bg-white p-4 mb-3 rounded-2xl border border-gray-100 shadow-sm">
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-500 text-sm">
          {item.deliveredAt
            ? dayjs(item.deliveredAt).format("MMM D, h:mm A")
            : dayjs(item.createdAt).format("MMM D, h:mm A")}
        </Text>
        <Text className="font-bold text-emerald-600">
          +${Number(item.riderEarnings || 0).toFixed(2)}
        </Text>
      </View>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
          {item.restaurantName || "Order #" + item.id}
        </Text>
        <View className="bg-emerald-100 px-2 py-1 rounded">
          <Text className="text-emerald-700 text-xs font-bold">Delivered</Text>
        </View>
      </View>
      <View className="flex-row items-center border-t border-gray-50 pt-3">
        <Ionicons name="location-outline" size={14} color="#6b7280" />
        <Text className="text-gray-500 text-sm ml-1 flex-1" numberOfLines={1}>
          {item.deliveryAddress}
        </Text>
        <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
        <Text className="text-gray-500 text-sm">
          ${Number(item.total || 0).toFixed(2)} order
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-900">Delivery History</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Ionicons name="refresh-outline" size={22} color="#10b981" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : !history || history.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="bicycle-outline" size={64} color="#9ca3af" />
          <Text className="text-gray-500 mt-4 text-lg font-medium">No deliveries yet</Text>
          <Text className="text-gray-400 mt-2 text-center">
            Complete your first delivery to see it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
