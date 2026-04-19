import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function OTPVerificationScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-2">Verification</Text>
      </View>

      <View className="flex-1 px-6 pt-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</Text>
        <Text className="text-gray-500 mb-8">
          We've sent a 4-digit code to +1 234 567 8900
        </Text>

        <View className="flex-row justify-between mb-8">
          {[1, 2, 3, 4].map((i) => (
            <TextInput
              key={i}
              className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-2xl text-center text-2xl font-bold text-gray-900"
              maxLength={1}
              keyboardType="number-pad"
            />
          ))}
        </View>

        <TouchableOpacity className="mb-8">
          <Text className="text-emerald-600 font-medium text-center">
            Resend Code (00:45)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-emerald-500 py-4 rounded-xl items-center"
          onPress={() => router.push('/(onboarding)/documents')}
        >
          <Text className="text-white font-bold text-lg">Verify</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
