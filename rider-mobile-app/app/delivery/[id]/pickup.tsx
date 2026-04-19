import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function PickupScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 z-10 bg-white shadow-sm">
        <TouchableOpacity onPress={() => router.push('/(tabs)')} className="p-2">
          <Ionicons name="chevron-down" color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Go to Restaurant</Text>
        <View className="w-10" />
      </View>

      {/* Map Placeholder */}
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <Ionicons name="map" size={64} color="#9ca3af" />
        <Text className="text-gray-500 mt-2">Map Navigation Placeholder</Text>
        
        {/* Route Line Mock */}
        <View className="absolute w-3/4 h-32 border-l-4 border-b-4 border-blue-500 rounded-bl-3xl opacity-50" />
      </View>

      {/* Bottom Sheet Details */}
      <View className="bg-white rounded-t-3xl shadow-lg border-t border-gray-100 p-6">
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-1">Burger King</Text>
            <Text className="text-gray-500 text-base">123 Main Street, Downtown</Text>
          </View>
          <View className="bg-orange-100 px-3 py-1 rounded-full">
            <Text className="text-orange-700 font-bold text-xs">8 mins away</Text>
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
          onPress={() => router.push('/delivery/123/confirm-pickup')}
        >
          <Text className="text-white font-bold text-lg">Arrived at Restaurant</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
