import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { showToast } from "@/utils/toast";

export default function EmailVerificationScreen() {
  const router = useRouter();
  const [resent, setResent] = useState(false);

  const { mutate, isLoading } = useQueryMutation({
    url: "/auth/email/verify/resend",
  });

  const handleResend = () => {
    mutate(
      {},
      {
        onSuccess: () => {
          setResent(true);
          showToast({ text: "Verification email sent!", type: "success" });
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message || "Failed to resend";
          showToast({ text: message, type: "error" });
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-2">Verification</Text>
      </View>

      <View className="flex-1 px-6 pt-8 items-center">
        <View className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="mail-outline" size={48} color="#059669" />
        </View>

        <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">Check Your Email</Text>
        <Text className="text-gray-500 mb-8 text-center text-base px-4">
          We've sent a verification link to your email address. Please click the link to verify your account.
        </Text>

        <TouchableOpacity
          className={`w-full py-4 rounded-xl items-center mb-4 ${isLoading ? "bg-emerald-400" : "bg-emerald-500"}`}
          onPress={handleResend}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {resent ? "Resend Again" : "Resend Verification Email"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full bg-gray-100 py-4 rounded-xl items-center"
          onPress={() => router.replace("/(onboarding)/documents")}
        >
          <Text className="text-gray-700 font-bold text-lg">Continue to Setup</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
