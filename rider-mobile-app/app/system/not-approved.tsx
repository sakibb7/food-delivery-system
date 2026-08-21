import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NotApprovedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-amber-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="lock-closed-outline" size={48} color="#d97706" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          Account Not Verified
        </Text>
        <Text className="text-gray-500 text-center text-base px-4">
          You cannot go online yet because your account is still pending verification. Please wait for an admin to approve your documents.
        </Text>
      </View>

      <TouchableOpacity 
        className="w-full bg-gray-100 py-4 rounded-xl items-center"
        onPress={() => router.push('/(onboarding)/account-review')}
      >
        <Text className="text-gray-700 font-bold text-lg">Check Status</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
