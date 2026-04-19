import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { showToast } from "@/app/utils/toast";
import { privateInstance } from "@/configs/axiosConfig";

type VehicleType = "bicycle" | "scooter" | "car";

export default function DocumentsScreen() {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState<VehicleType>("bicycle");
  const [vehicleMakeModel, setVehicleMakeModel] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [drivingLicenseUri, setDrivingLicenseUri] = useState<string | null>(null);
  const [vehicleRegUri, setVehicleRegUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async (setter: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setter(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      const filename = uri.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      formData.append("file", { uri, name: filename, type } as any);

      const res = await privateInstance.post("/cloudinary", formData);
      return res.data?.data?.url || res.data?.url || null;
    } catch (err) {
      console.error("Upload failed:", err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!vehicleMakeModel.trim()) {
      showToast({ text: "Please enter vehicle make & model", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      let drivingLicenseUrl: string | undefined;
      let vehicleRegistrationUrl: string | undefined;

      if (drivingLicenseUri) {
        const url = await uploadImage(drivingLicenseUri);
        if (url) drivingLicenseUrl = url;
      }
      if (vehicleRegUri) {
        const url = await uploadImage(vehicleRegUri);
        if (url) vehicleRegistrationUrl = url;
      }

      await privateInstance.post("/rider/profile", {
        vehicleType,
        vehicleMakeModel: vehicleMakeModel.trim(),
        vehicleRegistration: vehicleRegistration.trim() || undefined,
        drivingLicenseUrl,
        vehicleRegistrationUrl,
      });

      showToast({ text: "Documents submitted successfully!", type: "success" });
      router.replace("/(onboarding)/account-review");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to submit documents";
      showToast({ text: message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const vehicleOptions: { type: VehicleType; icon: string; label: string }[] = [
    { type: "bicycle", icon: "bicycle", label: "Bicycle" },
    { type: "scooter", icon: "construct-outline", label: "Scooter" },
    { type: "car", icon: "car-outline", label: "Car" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-2">Rider Setup</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-500 mb-6">
          Set up your vehicle and upload required documents to start delivering.
        </Text>

        {/* Vehicle Type */}
        <Text className="text-gray-600 mb-2 font-medium">Vehicle Type</Text>
        <View className="flex-row border border-gray-200 rounded-xl overflow-hidden mb-6">
          {vehicleOptions.map((opt) => (
            <TouchableOpacity
              key={opt.type}
              className={`flex-1 py-3 items-center ${vehicleType === opt.type ? "bg-emerald-50" : "bg-white"} ${opt.type !== "car" ? "border-r border-gray-200" : ""}`}
              onPress={() => setVehicleType(opt.type)}
            >
              <Ionicons
                name={opt.icon as any}
                size={24}
                color={vehicleType === opt.type ? "#059669" : "#9ca3af"}
              />
              <Text className={`font-bold mt-1 ${vehicleType === opt.type ? "text-emerald-700" : "text-gray-500"}`}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Make & Model */}
        <View className="mb-6">
          <Text className="text-gray-600 mb-2 font-medium">Make & Model</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
            placeholder="e.g. Trek FX 2"
            value={vehicleMakeModel}
            onChangeText={setVehicleMakeModel}
          />
        </View>

        {/* Registration */}
        <View className="mb-6">
          <Text className="text-gray-600 mb-2 font-medium">Registration Number (Optional)</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-gray-900"
            placeholder="e.g. AB1234"
            value={vehicleRegistration}
            onChangeText={setVehicleRegistration}
          />
        </View>

        {/* Driving License Upload */}
        <View className="p-4 border border-gray-200 rounded-2xl border-dashed mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-bold text-gray-900">Driving License</Text>
            {drivingLicenseUri ? (
              <View className="bg-emerald-100 px-2 py-1 rounded">
                <Text className="text-emerald-700 text-xs font-bold">Uploaded</Text>
              </View>
            ) : (
              <View className="bg-amber-100 px-2 py-1 rounded">
                <Text className="text-amber-700 text-xs font-bold">Optional</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-500 text-sm mb-4">Front of your valid driving license.</Text>
          {drivingLicenseUri && (
            <Image source={{ uri: drivingLicenseUri }} className="w-full h-32 rounded-xl mb-3" resizeMode="cover" />
          )}
          <TouchableOpacity
            className="bg-gray-50 py-3 rounded-xl items-center border border-gray-200 flex-row justify-center"
            onPress={() => pickImage(setDrivingLicenseUri)}
          >
            <Ionicons name="camera-outline" size={20} color="#374151" />
            <Text className="text-gray-700 font-bold ml-2">
              {drivingLicenseUri ? "Change File" : "Upload File"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle Registration Upload */}
        <View className="p-4 border border-gray-200 rounded-2xl border-dashed mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-bold text-gray-900">Vehicle Registration</Text>
            {vehicleRegUri ? (
              <View className="bg-emerald-100 px-2 py-1 rounded">
                <Text className="text-emerald-700 text-xs font-bold">Uploaded</Text>
              </View>
            ) : (
              <View className="bg-amber-100 px-2 py-1 rounded">
                <Text className="text-amber-700 text-xs font-bold">Optional</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-500 text-sm mb-4">Your official vehicle registration document.</Text>
          {vehicleRegUri && (
            <Image source={{ uri: vehicleRegUri }} className="w-full h-32 rounded-xl mb-3" resizeMode="cover" />
          )}
          <TouchableOpacity
            className="bg-gray-50 py-3 rounded-xl items-center border border-gray-200 flex-row justify-center"
            onPress={() => pickImage(setVehicleRegUri)}
          >
            <Ionicons name="camera-outline" size={20} color="#374151" />
            <Text className="text-gray-700 font-bold ml-2">
              {vehicleRegUri ? "Change File" : "Upload File"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className={`py-4 rounded-xl items-center mt-4 mb-8 ${submitting ? "bg-emerald-400" : "bg-emerald-500"}`}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Submit & Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
