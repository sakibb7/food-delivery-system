import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { useAuthStore } from "@/stores/useAuthStore";
import { showToast } from "@/app/utils/toast";
import { privateInstance } from "@/configs/axiosConfig";

export default function SignInScreen() {
  const router = useRouter();
  const { login, setRiderProfile } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);

  const { mutate, isLoading, backendErrors } = useQueryMutation({
    isPublic: true,
    url: "/auth/login",
  });

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      showToast({ text: "Please fill in all fields", type: "error" });
      return;
    }

    mutate(
      { email: email.trim(), password },
      {
        onSuccess: async (data: any) => {
          const { user, accessToken } = data?.data || {};
          if (!user || !accessToken) {
            showToast({ text: "Login failed. Please try again.", type: "error" });
            return;
          }

          login(user, accessToken);
          setRouteLoading(true);

          try {
            const profileRes = await privateInstance.get("/rider/profile");
            const profile = profileRes.data?.data;

            if (profile) {
              setRiderProfile(profile);
              if (profile.approvalStatus === "approved") {
                router.replace("/(tabs)");
              } else if (profile.approvalStatus === "rejected") {
                router.replace("/(onboarding)/account-rejected");
              } else {
                router.replace("/(onboarding)/account-review");
              }
            } else {
              router.replace("/(onboarding)/documents");
            }
          } catch (err: any) {
            if (err?.response?.status === 404) {
              router.replace("/(onboarding)/documents");
            } else {
              router.replace("/(onboarding)/documents");
            }
          } finally {
            setRouteLoading(false);
          }
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message || err?.message || "Login failed";
          showToast({ text: message, type: "error" });
        },
      }
    );
  };

  const busy = isLoading || routeLoading;

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
            <Text className="text-gray-600 mb-2 font-medium">Email Address</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!busy}
            />
            {backendErrors?.email && (
              <Text className="text-red-500 text-sm mt-1">{backendErrors.email}</Text>
            )}
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Password</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!busy}
            />
            {backendErrors?.password && (
              <Text className="text-red-500 text-sm mt-1">{backendErrors.password}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          className={`py-4 rounded-xl items-center mt-10 ${busy ? "bg-emerald-400" : "bg-emerald-500"}`}
          onPress={handleLogin}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Log In</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
