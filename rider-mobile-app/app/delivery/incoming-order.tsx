import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

const { width } = Dimensions.get('window');

export default function IncomingOrderScreen() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft === 0) {
      router.back();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

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
            <Text className="text-emerald-700 font-bold ml-2">00:{timeLeft.toString().padStart(2, '0')}</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center">New Delivery Request</Text>
        </View>

        <View className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="restaurant" size={20} color="#ea580c" />
            </View>
            <View>
              <Text className="font-bold text-gray-900 text-lg">Burger King</Text>
              <Text className="text-gray-500">1.2 km away</Text>
            </View>
          </View>
          
          <View className="flex-row items-center border-t border-gray-200 pt-4 mt-2">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
               <Ionicons name="location" size={20} color="#2563eb" />
            </View>
            <View>
              <Text className="font-bold text-gray-900 text-lg">Customer Dropoff</Text>
              <Text className="text-gray-500">3.5 km total distance</Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-8 px-4">
          <View>
            <Text className="text-gray-500 mb-1">Estimated Earnings</Text>
            <Text className="text-3xl font-bold text-emerald-600">$7.50</Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-500 mb-1">Est. Time</Text>
            <Text className="text-2xl font-bold text-gray-900">24 min</Text>
          </View>
        </View>

        <View className="flex-row gap-4">
          <TouchableOpacity 
            className="flex-1 bg-red-50 py-4 rounded-xl items-center border border-red-200"
            onPress={() => router.back()}
          >
            <Text className="text-red-600 font-bold text-lg">Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-1 bg-emerald-500 py-4 rounded-xl items-center shadow-sm"
            onPress={() => {
              router.replace('/delivery/123/pickup');
            }}
          >
            <Text className="text-white font-bold text-lg">Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
