import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useCallback, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { privateInstance } from "@/configs/axiosConfig";
import { showToast } from "@/utils/toast";

export default function AccountReviewScreen() {
  const router = useRouter();
  const { logout, setRiderProfile } = useAuthStore();
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const res = await privateInstance.get("/rider/profile");
      const profile = res.data?.data;
      if (profile) {
        setRiderProfile(profile);
        if (profile.approvalStatus === "approved") {
          showToast({ text: "Your account has been approved!", type: "success" });
          router.replace("/(tabs)");
          return;
        } else if (profile.approvalStatus === "rejected") {
          router.replace("/(onboarding)/account-rejected");
          return;
        }
      }
    } catch (err) {
      console.error("Failed to check status:", err);
    } finally {
      setChecking(false);
    }
  }, []);

  // Poll every 30 seconds
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleLogout = () => {
    logout();
    router.replace("/(auth)");
  };

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-amber-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="time-outline" size={48} color="#d97706" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          Application Under Review
        </Text>
        <Text className="text-gray-500 text-center text-base px-4">
          We have received your documents. Our team is currently reviewing your application. This usually takes 1-2 business days.
        </Text>
      </View>

      <TouchableOpacity
        className={`w-full py-4 rounded-xl items-center mb-4 ${checking ? "bg-emerald-400" : "bg-emerald-500"}`}
        onPress={checkStatus}
        disabled={checking}
      >
        {checking ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Check Status</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full bg-gray-100 py-4 rounded-xl items-center"
        onPress={handleLogout}
      >
        <Text className="text-gray-700 font-bold text-lg">Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
