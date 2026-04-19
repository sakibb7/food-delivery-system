import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function VehicleScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-2">Vehicle Information</Text>
      </View>

      <View className="flex-1 px-6 pt-6">
        <View className="gap-5">
          <View>
            <Text className="text-gray-600 mb-2 font-medium">Vehicle Type</Text>
            <View className="flex-row border border-gray-200 rounded-xl overflow-hidden">
              <TouchableOpacity className="flex-1 bg-emerald-50 py-3 items-center border-r border-gray-200">
                <Ionicons name="bicycle" size={24} color="#059669" />
                <Text className="text-emerald-700 font-bold mt-1">Bicycle</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-white py-3 items-center border-r border-gray-200">
                 <Ionicons name="construct-outline" size={24} color="#9ca3af" />
                 <Text className="text-gray-500 font-bold mt-1">Scooter</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-white py-3 items-center">
                 <Ionicons name="car-outline" size={24} color="#9ca3af" />
                 <Text className="text-gray-500 font-bold mt-1">Car</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Make & Model</Text>
            <TextInput 
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              value="Trek FX 2"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Registration Number (Optional)</Text>
            <TextInput 
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              placeholder="e.g. AB1234"
            />
          </View>
        </View>

        <TouchableOpacity 
          className="bg-emerald-500 py-4 rounded-xl items-center mt-10"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold text-lg">Update Vehicle</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
