import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { privateInstance } from "@/configs/axiosConfig";
import { storage } from "@/configs/storage";
import { TOKEN_NAME } from "@/configs";

export default function Index() {
  const { isLoggedIn, setUser, setRiderProfile, logout } = useAuthStore();
  const [redirect, setRedirect] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = storage.getString(TOKEN_NAME);
      if (!token) {
        setRedirect("/(auth)");
        setLoading(false);
        return;
      }

      try {
        // Try fetching rider profile to determine where to route
        const profileRes = await privateInstance.get("/rider/profile");
        const profile = profileRes.data?.data;

        if (profile) {
          setRiderProfile(profile);
          if (profile.approvalStatus === "approved") {
            setRedirect("/(tabs)");
          } else if (profile.approvalStatus === "rejected") {
            setRedirect("/(onboarding)/account-rejected");
          } else {
            setRedirect("/(onboarding)/account-review");
          }
        } else {
          setRedirect("/(onboarding)/documents");
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) {
          logout();
          setRedirect("/(auth)");
        } else if (status === 404) {
          // No rider profile yet
          setRedirect("/(onboarding)/documents");
        } else {
          setRedirect("/(auth)");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return <Redirect href={redirect as any} />;
}
