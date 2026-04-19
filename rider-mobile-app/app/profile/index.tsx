import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, riderProfile, logout, setRiderProfile, setUser } = useAuthStore();

  const { data: profileData, isLoading } = useGetQuery<any>({
    url: "/rider/profile",
    queryKey: "rider-profile",
  });

  const profile = profileData || riderProfile;
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Rider";
  const displayEmail = user?.email || "";
  const displayPhone = user?.phone || "";

  const handleLogout = () => {
    logout();
    router.replace("/(auth)");
  };

  const MenuItem = ({ icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity
      className="flex-row items-center justify-between p-4 border-b border-gray-50 bg-white"
      onPress={onPress}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3">
          <Ionicons name={icon} size={20} color="#374151" />
        </View>
        <View>
          <Text className="text-lg font-medium text-gray-800">{title}</Text>
          {subtitle && <Text className="text-gray-500 text-sm">{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text className="text-red-500 font-bold">Log Out</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="bg-white p-6 items-center border-b border-gray-100 mb-4">
            <View className="w-24 h-24 bg-gray-200 rounded-full mb-4 items-center justify-center overflow-hidden">
              <Ionicons name="person" size={48} color="#9ca3af" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-1">{displayName}</Text>
            <Text className="text-gray-500 mb-3">
              {displayEmail}
              {displayPhone ? ` • ${displayPhone}` : ""}
            </Text>

            <View className="flex-row items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text className="text-yellow-700 font-bold">{profile?.rating ? parseFloat(profile.rating).toFixed(1) : "0.0"}</Text>
              <Text className="text-yellow-600/70 text-sm">({profile?.totalReviews || 0} reviews)</Text>
            </View>

            <View className="flex-row mt-4">
              {profile?.approvalStatus === "approved" && (
                <View className="bg-emerald-100 px-3 py-1 rounded-full flex-row items-center mr-2">
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text className="text-emerald-700 font-bold ml-1">Verified Rider</Text>
                </View>
              )}
              {profile?.isOnline && (
                <View className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
                  <View className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                  <Text className="text-blue-700 font-bold">Online</Text>
                </View>
              )}
              {profile?.approvalStatus === "pending" && (
                <View className="bg-amber-100 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="time" size={14} color="#d97706" />
                  <Text className="text-amber-700 font-bold ml-1">Pending Review</Text>
                </View>
              )}
            </View>
          </View>

          <View className="bg-white border-y border-gray-100 mb-4">
            <MenuItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update your personal info"
              onPress={() => router.push("/profile/edit")}
            />
            <MenuItem
              icon="bicycle-outline"
              title="Vehicle Information"
              subtitle={profile?.vehicleMakeModel || "Set up your vehicle"}
              onPress={() => router.push("/profile/vehicle")}
            />
            <MenuItem icon="card-outline" title="Bank Details" subtitle="Manage payouts" />
          </View>

          <View className="bg-white border-y border-gray-100 mb-4">
            <MenuItem
              icon="star-outline"
              title="My Reviews"
              subtitle="See what customers are saying"
              onPress={() => router.push("/profile/reviews")}
            />
          </View>

          <View className="bg-white border-y border-gray-100 mb-8">
            <MenuItem icon="settings-outline" title="Settings" />
            <MenuItem icon="help-buoy-outline" title="Help & Support" />
            <MenuItem icon="document-text-outline" title="Terms & Privacy" />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
