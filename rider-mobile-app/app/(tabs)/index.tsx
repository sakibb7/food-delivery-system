import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header / Status Toggle */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10 shadow-sm">
        <View className="flex-row items-center">
          <View className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          <Text className="text-lg font-bold text-gray-900">
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={setIsOnline}
          trackColor={{ false: '#d1d5db', true: '#a7f3d0' }}
          thumbColor={isOnline ? '#10b981' : '#f3f4f6'}
        />
      </View>

      {/* Map Placeholder Area */}
      <View className="flex-1 bg-gray-100 relative items-center justify-center">
        <Ionicons name="map-outline" size={64} color="#9ca3af" />
        <Text className="text-gray-500 mt-4 font-medium">Map View Placeholder</Text>
        
        {/* Offline Overlay */}
        {!isOnline && (
          <View className="absolute inset-0 bg-white/70 items-center justify-center p-6">
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-center">
              <Ionicons name="moon-outline" size={48} color="#9ca3af" className="mb-4" />
              <Text className="text-xl font-bold text-gray-900 mb-2">You are Offline</Text>
              <Text className="text-gray-500 text-center">
                Go online to start receiving delivery requests.
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Summary Sheet */}
      <View className="bg-white rounded-t-3xl shadow-lg px-6 pt-6 pb-8 border-t border-gray-100">
        <Text className="text-lg font-bold text-gray-900 mb-4">Today's Summary</Text>
        <View className="flex-row justify-between">
          <View className="bg-gray-50 flex-1 p-4 rounded-2xl mr-2 items-center">
            <Text className="text-gray-500 text-sm mb-1">Earnings</Text>
            <Text className="text-2xl font-bold text-emerald-600">$45.50</Text>
          </View>
          <View className="bg-gray-50 flex-1 p-4 rounded-2xl ml-2 items-center">
            <Text className="text-gray-500 text-sm mb-1">Deliveries</Text>
            <Text className="text-2xl font-bold text-gray-900">8</Text>
          </View>
        </View>

        {/* DEMO BUTTON: Trigger Incoming Order */}
        {isOnline && (
          <TouchableOpacity 
            className="mt-6 bg-blue-50 py-4 rounded-xl items-center border border-blue-200"
            onPress={() => router.push('/delivery/incoming-order')}
          >
            <Text className="text-blue-600 font-bold">Demo: Simulate New Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
