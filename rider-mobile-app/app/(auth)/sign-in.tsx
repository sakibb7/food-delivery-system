import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SignInScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" color="#374151" size={24} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 pt-4">
        <Text className="text-3xl font-bold text-gray-900 mb-8">Welcome Back</Text>

        <View className="gap-5">
          <View>
            <Text className="text-gray-600 mb-2 font-medium">Phone Number or Email</Text>
            <TextInput 
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              placeholder="Enter your details"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Password</Text>
            <TextInput 
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              placeholder="Enter your password"
              secureTextEntry
            />
            <TouchableOpacity className="mt-2 self-end">
              <Text className="text-emerald-600 font-medium">Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          className="bg-emerald-500 py-4 rounded-xl items-center mt-10"
          onPress={() => router.push('/(tabs)')}
        >
          <Text className="text-white font-bold text-lg">Log In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
