import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function DocumentsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-2">Upload Documents</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        <Text className="text-gray-500 mb-8">
          Please provide the following documents to verify your identity and vehicle.
        </Text>

        <View className="gap-6">
          <View className="p-4 border border-gray-200 rounded-2xl border-dashed">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-bold text-gray-900">Driving License</Text>
              <View className="bg-amber-100 px-2 py-1 rounded">
                <Text className="text-amber-700 text-xs font-bold">Required</Text>
              </View>
            </View>
            <Text className="text-gray-500 text-sm mb-4">Front and back of your valid driving license.</Text>
            <TouchableOpacity className="bg-gray-50 py-3 rounded-xl items-center border border-gray-200 flex-row justify-center">
              <Ionicons name="camera-outline" size={20} color="#374151" />
              <Text className="text-gray-700 font-bold ml-2">Upload File</Text>
            </TouchableOpacity>
          </View>

          <View className="p-4 border border-gray-200 rounded-2xl border-dashed">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-bold text-gray-900">Vehicle Registration</Text>
              <View className="bg-amber-100 px-2 py-1 rounded">
                <Text className="text-amber-700 text-xs font-bold">Required</Text>
              </View>
            </View>
            <Text className="text-gray-500 text-sm mb-4">Your official vehicle registration document.</Text>
            <TouchableOpacity className="bg-gray-50 py-3 rounded-xl items-center border border-gray-200 flex-row justify-center">
              <Ionicons name="camera-outline" size={20} color="#374151" />
              <Text className="text-gray-700 font-bold ml-2">Upload File</Text>
            </TouchableOpacity>
          </View>

          <View className="p-4 border border-gray-200 rounded-2xl border-dashed">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-bold text-gray-900">Profile Photo</Text>
              <View className="bg-emerald-100 px-2 py-1 rounded">
                <Text className="text-emerald-700 text-xs font-bold">Uploaded</Text>
              </View>
            </View>
            <Text className="text-gray-500 text-sm">Clear photo of your face.</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="bg-emerald-500 py-4 rounded-xl items-center mt-10 mb-8"
          onPress={() => router.push('/account-review')}
        >
          <Text className="text-white font-bold text-lg">Submit Documents</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
