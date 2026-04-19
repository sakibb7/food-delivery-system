import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function DropoffScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 z-10 bg-white shadow-sm">
        <TouchableOpacity onPress={() => router.push('/(tabs)')} className="p-2">
          <Ionicons name="chevron-down" color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Deliver to Customer</Text>
        <View className="bg-red-100 px-3 py-1 rounded-full">
           <Text className="text-red-700 font-bold text-xs">SOS</Text>
        </View>
      </View>

      {/* Map Placeholder */}
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <Ionicons name="map" size={64} color="#9ca3af" />
        <Text className="text-gray-500 mt-2">Map Navigation to Customer</Text>
      </View>

      {/* Bottom Sheet Details */}
      <View className="bg-white rounded-t-3xl shadow-lg border-t border-gray-100 p-6">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
             <View className="w-12 h-12 bg-gray-200 rounded-full mr-3 items-center justify-center">
                <Ionicons name="person" size={24} color="#9ca3af" />
             </View>
             <View>
                <Text className="text-xl font-bold text-gray-900">Sarah Jenkins</Text>
                <Text className="text-gray-500">456 Elm St, Apt 4B</Text>
             </View>
          </View>
          <View className="flex-row gap-2">
             <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name="chatbubble" size={18} color="#374151" />
             </TouchableOpacity>
             <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name="call" size={18} color="#374151" />
             </TouchableOpacity>
          </View>
        </View>

        <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6">
           <View className="flex-row items-center mb-1">
              <Ionicons name="information-circle" size={16} color="#ca8a04" />
              <Text className="text-yellow-800 font-bold ml-1">Delivery Instructions</Text>
           </View>
           <Text className="text-yellow-800">"Leave at the front door. Do not ring the bell, baby is sleeping."</Text>
        </View>

        <TouchableOpacity 
          className="w-full bg-emerald-500 py-4 rounded-xl items-center"
          onPress={() => router.push('/delivery/success')}
        >
          <Text className="text-white font-bold text-lg">Swipe to Complete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
