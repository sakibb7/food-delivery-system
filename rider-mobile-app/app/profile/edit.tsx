import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-2">Edit Profile</Text>
      </View>

      <View className="flex-1 px-6 pt-6">
        <View className="gap-5">
          <View>
            <Text className="text-gray-600 mb-2 font-medium">Full Name</Text>
            <TextInput 
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              value="John Doe"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Email Address</Text>
            <TextInput 
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-500"
              value="johndoe@example.com"
              editable={false}
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Phone Number</Text>
            <TextInput 
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-500"
              value="+1 234 567 8900"
              editable={false}
            />
          </View>
        </View>

        <TouchableOpacity 
          className="bg-emerald-500 py-4 rounded-xl items-center mt-10"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold text-lg">Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
