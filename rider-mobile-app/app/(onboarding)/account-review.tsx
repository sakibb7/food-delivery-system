import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AccountReviewScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-amber-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="time-outline" size={48} color="#d97706" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          Application Under Review
        </Text>
        <Text className="text-gray-500 text-center text-base px-4">
          We have received your documents. Our team is currently reviewing your application. This usually takes 1-2 business days.
        </Text>
      </View>

      <TouchableOpacity 
        className="w-full bg-gray-100 py-4 rounded-xl items-center"
        onPress={() => router.push('/(auth)')}
      >
        <Text className="text-gray-700 font-bold text-lg">Log Out</Text>
      </TouchableOpacity>
      
      {/* DEMO BUTTON: To skip directly to the approved state */}
      <TouchableOpacity 
        className="w-full bg-emerald-50 py-4 rounded-xl items-center mt-4 border border-emerald-200"
        onPress={() => router.push('/(tabs)')}
      >
        <Text className="text-emerald-700 font-bold text-sm">Demo: Skip to App</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
