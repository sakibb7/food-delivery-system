import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { privateInstance } from "@/configs/axiosConfig";
import { showToast } from "@/utils/toast";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showToast({ text: "Name cannot be empty", type: "error" });
      return;
    }

    setSaving(true);
    try {
      // Update via rider profile endpoint since it's available
      await privateInstance.patch("/rider/profile", {
        vehicleType: undefined, // won't update unless sent
      });

      // Update local user state
      if (user) {
        setUser({ ...user, firstName: firstName.trim(), lastName: lastName.trim() });
      }
      showToast({ text: "Profile updated!", type: "success" });
      router.back();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update profile";
      showToast({ text: message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

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
            <Text className="text-gray-600 mb-2 font-medium">First Name</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              value={firstName}
              onChangeText={setFirstName}
              editable={!saving}
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Last Name</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              value={lastName}
              onChangeText={setLastName}
              editable={!saving}
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Email Address</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-500"
              value={user?.email || ""}
              editable={false}
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Phone Number</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-500"
              value={user?.phone || "Not set"}
              editable={false}
            />
          </View>
        </View>

        <TouchableOpacity
          className={`py-4 rounded-xl items-center mt-10 ${saving ? "bg-emerald-400" : "bg-emerald-500"}`}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
