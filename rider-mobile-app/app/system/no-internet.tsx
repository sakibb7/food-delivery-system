import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NoInternetScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="wifi-outline" size={48} color="#dc2626" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          No Internet Connection
        </Text>
        <Text className="text-gray-500 text-center text-base px-4">
          Please check your network settings and make sure you have an active data connection to use the rider app.
        </Text>
      </View>

      <TouchableOpacity 
        className="w-full bg-emerald-500 py-4 rounded-xl items-center"
        onPress={() => router.back()} // Ideally re-check connection
      >
        <Text className="text-white font-bold text-lg">Try Again</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
