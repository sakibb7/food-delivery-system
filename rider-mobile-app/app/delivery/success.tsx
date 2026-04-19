import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function DeliverySuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-emerald-500 justify-center items-center p-6">
      <View className="bg-white rounded-3xl w-full p-8 shadow-2xl items-center">
        <View className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-done" size={48} color="#10b981" />
        </View>
        
        <Text className="text-3xl font-bold text-gray-900 text-center mb-2">Delivery Complete!</Text>
        <Text className="text-gray-500 text-center mb-8">Great job. You've successfully delivered the order to Sarah.</Text>

        <View className="w-full border-t border-b border-gray-100 py-6 mb-8 flex-row justify-between">
          <View>
            <Text className="text-gray-500 mb-1">Earned</Text>
            <Text className="text-3xl font-bold text-emerald-600">$7.50</Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-500 mb-1">Time taken</Text>
            <Text className="text-2xl font-bold text-gray-900">22 min</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="w-full bg-gray-900 py-4 rounded-xl items-center"
          onPress={() => router.push('/(tabs)')}
        >
          <Text className="text-white font-bold text-lg">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
