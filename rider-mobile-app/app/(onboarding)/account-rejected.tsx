import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AccountRejectedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="close-circle-outline" size={48} color="#dc2626" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          Application Rejected
        </Text>
        <Text className="text-gray-500 text-center text-base px-4">
          Unfortunately, we could not approve your application at this time due to issues with the provided documents. Please update your documents and try again.
        </Text>
      </View>

      <TouchableOpacity 
        className="w-full bg-emerald-500 py-4 rounded-xl items-center"
        onPress={() => router.push('/(onboarding)/documents')}
      >
        <Text className="text-white font-bold text-lg">Update Documents</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="w-full bg-gray-100 py-4 rounded-xl items-center mt-4"
        onPress={() => router.push('/(auth)')}
      >
        <Text className="text-gray-700 font-bold text-lg">Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
