import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const MenuItem = ({ icon, title, onPress }: any) => (
    <TouchableOpacity 
      className="flex-row items-center justify-between p-4 border-b border-gray-50 bg-white"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3">
          <Ionicons name={icon} size={20} color="#374151" />
        </View>
        <Text className="text-lg font-medium text-gray-800">{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)')}>
          <Text className="text-red-500 font-bold">Log Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className="bg-white p-6 items-center border-b border-gray-100 mb-4">
          <View className="w-24 h-24 bg-gray-200 rounded-full mb-4 items-center justify-center overflow-hidden">
             <Ionicons name="person" size={48} color="#9ca3af" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-1">John Doe</Text>
          <Text className="text-gray-500">johndoe@example.com • +1 234 567 8900</Text>
          
          <View className="flex-row mt-4">
            <View className="bg-amber-100 px-3 py-1 rounded-full flex-row items-center mr-2">
              <Ionicons name="star" size={14} color="#d97706" />
              <Text className="text-amber-700 font-bold ml-1">4.9 Rating</Text>
            </View>
            <View className="bg-emerald-100 px-3 py-1 rounded-full flex-row items-center">
               <Ionicons name="checkmark-circle" size={14} color="#059669" />
              <Text className="text-emerald-700 font-bold ml-1">Verified Rider</Text>
            </View>
          </View>
        </View>

        <View className="bg-white border-y border-gray-100 mb-4">
          <MenuItem icon="person-outline" title="Edit Profile" onPress={() => router.push('/(tabs)/profile/edit')} />
          <MenuItem icon="bicycle-outline" title="Vehicle Information" onPress={() => router.push('/(tabs)/profile/vehicle')} />
          <MenuItem icon="card-outline" title="Bank Details" />
        </View>

        <View className="bg-white border-y border-gray-100 mb-8">
          <MenuItem icon="settings-outline" title="Settings" />
          <MenuItem icon="help-buoy-outline" title="Help & Support" />
          <MenuItem icon="document-text-outline" title="Terms & Privacy" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
