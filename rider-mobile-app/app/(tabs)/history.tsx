import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const demoHistory = [
  { id: '1', date: 'Today, 2:30 PM', restaurant: 'Burger King', amount: '$5.50', status: 'Delivered', distance: '2.4 km' },
  { id: '2', date: 'Today, 1:15 PM', restaurant: 'Pizza Hut', amount: '$7.20', status: 'Delivered', distance: '3.8 km' },
  { id: '3', date: 'Yesterday, 8:45 PM', restaurant: 'Sushi Train', amount: '$6.00', status: 'Delivered', distance: '2.1 km' },
  { id: '4', date: 'Yesterday, 7:10 PM', restaurant: 'Taco Bell', amount: '$4.80', status: 'Delivered', distance: '1.5 km' },
  { id: '5', date: 'Oct 24, 12:30 PM', restaurant: 'KFC', amount: '$5.90', status: 'Delivered', distance: '2.9 km' },
];

export default function HistoryScreen() {
  const router = useRouter();

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      className="bg-white p-4 mb-3 rounded-2xl border border-gray-100 shadow-sm"
      onPress={() => {
        // We'll just alert for now, or could route to a history detail page
        // router.push(`/history/${item.id}`);
      }}
    >
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-500 text-sm">{item.date}</Text>
        <Text className="font-bold text-gray-900">{item.amount}</Text>
      </View>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-900">{item.restaurant}</Text>
        <View className="bg-emerald-100 px-2 py-1 rounded">
          <Text className="text-emerald-700 text-xs font-bold">{item.status}</Text>
        </View>
      </View>
      <View className="flex-row items-center border-t border-gray-50 pt-3">
        <Ionicons name="bicycle-outline" size={16} color="#6b7280" />
        <Text className="text-gray-500 text-sm ml-1">{item.distance}</Text>
        <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
        <Text className="text-emerald-600 font-medium text-sm">View Details</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Delivery History</Text>
      </View>

      <FlatList
        data={demoHistory}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
