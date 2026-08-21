import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-between p-6">
      <View className="flex-1 items-center justify-center w-full">
        {/* Placeholder for Logo */}
        <View className="w-32 h-32 bg-emerald-100 rounded-full items-center justify-center mb-8">
          <Text className="text-emerald-500 font-bold text-2xl">LOGO</Text>
        </View>
        <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
          Ride & Earn
        </Text>
        <Text className="text-gray-500 text-center text-lg mb-8">
          Join our delivery network and earn money on your own schedule.
        </Text>
      </View>

      <View className="w-full gap-4 pb-8">
        <TouchableOpacity 
          className="bg-emerald-500 py-4 rounded-xl items-center"
          onPress={() => router.push('/sign-in')}
        >
          <Text className="text-white font-bold text-lg">Log In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-emerald-50 py-4 rounded-xl items-center border border-emerald-200"
          onPress={() => router.push('/sign-up')}
        >
          <Text className="text-emerald-600 font-bold text-lg">Sign Up to Ride</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
