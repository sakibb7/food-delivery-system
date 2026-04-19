import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const demoNotifications = [
  { id: '1', title: 'Payment Successful', desc: 'Your weekly payout of $340.00 has been transferred to your bank account.', time: '2 hours ago', icon: 'cash-outline', color: '#10b981', bg: '#ecfdf5' },
  { id: '2', title: 'High Demand Alert', desc: 'Demand is high in downtown! Go online now to earn an extra $2 per delivery.', time: '5 hours ago', icon: 'trending-up-outline', color: '#f59e0b', bg: '#fffbeb' },
  { id: '3', title: 'System Update', desc: 'The app will be down for maintenance from 2 AM to 4 AM tonight.', time: '1 day ago', icon: 'information-circle-outline', color: '#3b82f6', bg: '#eff6ff' },
  { id: '4', title: 'Document Approved', desc: 'Your vehicle registration document has been approved.', time: '3 days ago', icon: 'checkmark-circle-outline', color: '#10b981', bg: '#ecfdf5' },
];

export default function NotificationsScreen() {
  const renderItem = ({ item }: any) => (
    <TouchableOpacity className="flex-row p-4 border-b border-gray-100 bg-white">
      <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: item.bg }}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between mb-1">
          <Text className="font-bold text-gray-900 text-base">{item.title}</Text>
        </View>
        <Text className="text-gray-500 text-sm mb-2 leading-5">{item.desc}</Text>
        <Text className="text-gray-400 text-xs">{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
      </View>

      <FlatList
        data={demoNotifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
