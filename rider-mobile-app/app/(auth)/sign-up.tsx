import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { useAuthStore } from "@/stores/useAuthStore";
import { showToast } from "@/app/utils/toast";

export default function SignUpScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { mutate, isLoading, backendErrors } = useQueryMutation({
    isPublic: true,
    url: "/auth/register/rider",
  });

  const handleSignUp = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      showToast({ text: "Please fill in all required fields", type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      showToast({ text: "Passwords do not match", type: "error" });
      return;
    }

    mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        confirmPassword,
      },
      {
        onSuccess: (data: any) => {
          const result = data?.data || data;
          const { user, accessToken } = result;
          if (user && accessToken) {
            login(user, accessToken);
            showToast({ text: "Account created successfully!", type: "success" });
            router.replace("/(onboarding)/documents");
          } else {
            showToast({ text: "Registration succeeded. Please log in.", type: "success" });
            router.replace("/(auth)/sign-in");
          }
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message || err?.message || "Registration failed";
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
        <Text className="text-lg font-bold ml-2">Create Account</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-500 mb-8">Enter your personal details to get started as a rider.</Text>

        <View className="gap-5">
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-gray-600 mb-2 font-medium">First Name</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
                placeholder="John"
                value={firstName}
                onChangeText={setFirstName}
                editable={!isLoading}
              />
              {backendErrors?.firstName && (
                <Text className="text-red-500 text-sm mt-1">{backendErrors.firstName}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 mb-2 font-medium">Last Name</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
                placeholder="Doe"
                value={lastName}
                onChangeText={setLastName}
                editable={!isLoading}
              />
              {backendErrors?.lastName && (
                <Text className="text-red-500 text-sm mt-1">{backendErrors.lastName}</Text>
              )}
            </View>
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Email Address</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
            />
            {backendErrors?.email && (
              <Text className="text-red-500 text-sm mt-1">{backendErrors.email}</Text>
            )}
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Phone Number (Optional)</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              placeholder="+1 234 567 8900"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!isLoading}
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Password</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              placeholder="Min 6 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
            {backendErrors?.password && (
              <Text className="text-red-500 text-sm mt-1">{backendErrors.password}</Text>
            )}
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Confirm Password</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              placeholder="Re-enter password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
            />
            {backendErrors?.confirmPassword && (
              <Text className="text-red-500 text-sm mt-1">{backendErrors.confirmPassword}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          className={`py-4 rounded-xl items-center mt-10 mb-8 ${isLoading ? "bg-emerald-400" : "bg-emerald-500"}`}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Create Account</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
