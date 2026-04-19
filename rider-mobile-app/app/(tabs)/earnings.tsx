import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function EarningsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-6 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Earnings</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View className="m-6 bg-emerald-500 p-6 rounded-3xl shadow-sm">
          <Text className="text-emerald-50 text-base mb-1">Available Balance</Text>
          <Text className="text-white text-4xl font-bold mb-6">$124.50</Text>
          
          <TouchableOpacity className="bg-white py-3 rounded-xl items-center">
            <Text className="text-emerald-600 font-bold">Cash Out</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Stats */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">This Week</Text>
          <View className="flex-row justify-between bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <View>
              <Text className="text-gray-500 mb-1">Total Earned</Text>
              <Text className="text-xl font-bold text-gray-900">$340.00</Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-500 mb-1">Deliveries</Text>
              <Text className="text-xl font-bold text-gray-900">42</Text>
            </View>
          </View>
        </View>

        {/* Recent Payouts */}
        <View className="px-6 pb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Recent Payouts</Text>
            <TouchableOpacity>
              <Text className="text-emerald-600 font-medium">See All</Text>
            </TouchableOpacity>
          </View>

          {[
            { id: 1, date: 'Oct 24, 2026', amount: '$150.00', status: 'Completed' },
            { id: 2, date: 'Oct 17, 2026', amount: '$210.50', status: 'Completed' },
            { id: 3, date: 'Oct 10, 2026', amount: '$185.00', status: 'Completed' },
          ].map(payout => (
            <View key={payout.id} className="flex-row items-center justify-between py-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mr-3">
                  <Ionicons name="checkmark" size={20} color="#10b981" />
                </View>
                <View>
                  <Text className="font-bold text-gray-900 mb-1">{payout.date}</Text>
                  <Text className="text-gray-500 text-xs">{payout.status}</Text>
                </View>
              </View>
              <Text className="font-bold text-gray-900">{payout.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
