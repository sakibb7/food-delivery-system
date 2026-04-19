import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-2">Create Account</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-500 mb-8">Enter your personal details to get started.</Text>

        <View className="gap-5">
          <View>
            <Text className="text-gray-600 mb-2 font-medium">Full Name</Text>
            <TextInput 
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              placeholder="John Doe"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Email Address</Text>
            <TextInput 
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Phone Number</Text>
            <TextInput 
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              placeholder="+1 234 567 8900"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity 
          className="bg-emerald-500 py-4 rounded-xl items-center mt-10 mb-8"
          onPress={() => router.push('/otp-verification')}
        >
          <Text className="text-white font-bold text-lg">Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
