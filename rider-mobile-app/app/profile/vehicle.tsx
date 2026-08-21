import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import { privateInstance } from "@/configs/axiosConfig";
import { showToast } from "@/utils/toast";

type VehicleType = "bicycle" | "scooter" | "car";

export default function VehicleScreen() {
  const router = useRouter();
  const { riderProfile, setRiderProfile } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const { data: profileData, isLoading } = useGetQuery<any>({
    url: "/rider/profile",
    queryKey: "rider-vehicle-profile",
  });

  const profile = profileData || riderProfile;

  const [vehicleType, setVehicleType] = useState<VehicleType>(profile?.vehicleType || "bicycle");
  const [vehicleMakeModel, setVehicleMakeModel] = useState(profile?.vehicleMakeModel || "");
  const [vehicleRegistration, setVehicleRegistration] = useState(profile?.vehicleRegistration || "");

  useEffect(() => {
    if (profile) {
      setVehicleType(profile.vehicleType || "bicycle");
      setVehicleMakeModel(profile.vehicleMakeModel || "");
      setVehicleRegistration(profile.vehicleRegistration || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!vehicleMakeModel.trim()) {
      showToast({ text: "Please enter vehicle make & model", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const res = await privateInstance.patch("/rider/profile", {
        vehicleType,
        vehicleMakeModel: vehicleMakeModel.trim(),
        vehicleRegistration: vehicleRegistration.trim() || undefined,
      });

      const updated = res.data?.data;
      if (updated) {
        setRiderProfile(updated);
      }
      showToast({ text: "Vehicle updated!", type: "success" });
      router.back();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update vehicle";
      showToast({ text: message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const vehicleOptions: { type: VehicleType; icon: string; label: string }[] = [
    { type: "bicycle", icon: "bicycle", label: "Bicycle" },
    { type: "scooter", icon: "construct-outline", label: "Scooter" },
    { type: "car", icon: "car-outline", label: "Car" },
  ];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </SafeAreaView>
    );
  }

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
              {vehicleOptions.map((opt, index) => (
                <TouchableOpacity
                  key={opt.type}
                  className={`flex-1 py-3 items-center ${
                    vehicleType === opt.type ? "bg-emerald-50" : "bg-white"
                  } ${index < vehicleOptions.length - 1 ? "border-r border-gray-200" : ""}`}
                  onPress={() => setVehicleType(opt.type)}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={24}
                    color={vehicleType === opt.type ? "#059669" : "#9ca3af"}
                  />
                  <Text
                    className={`font-bold mt-1 ${
                      vehicleType === opt.type ? "text-emerald-700" : "text-gray-500"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Make & Model</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              value={vehicleMakeModel}
              onChangeText={setVehicleMakeModel}
              placeholder="e.g. Trek FX 2"
              editable={!saving}
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2 font-medium">Registration Number (Optional)</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
              placeholder="e.g. AB1234"
              value={vehicleRegistration}
              onChangeText={setVehicleRegistration}
              editable={!saving}
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
            <Text className="text-white font-bold text-lg">Update Vehicle</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
