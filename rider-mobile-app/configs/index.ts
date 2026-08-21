
import { Platform } from "react-native";

// export const SERVER_URL =
//   process.env.EXPO_PUBLIC_APP_ENV === "dev" ? (Platform.OS === "ios" ? process.env.EXPO_PUBLIC_API_BASE_URL_IOS : process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID) : process.env.EXPO_PUBLIC_API_BASE_URL;


export const SERVER_URL = "https://fooddeliverysystem.sakibb.com";
export const API_BASE_URL =
  SERVER_URL + (process.env.EXPO_PUBLIC_API_VERSION_PATH || "/api/v1");

export const TOKEN_NAME = process.env.EXPO_PUBLIC_TOKEN_NAME || "token";

export const MAINTENANCE = "MAINTENANCE";

export const ONBOARDING_STEPS = {
  documents: {
    value: "documents",
    url: "/(onboarding)/documents",
  },
  review: {
    value: "review",
    url: "/(onboarding)/account-review",
  },
  rejected: {
    value: "rejected",
    url: "/(onboarding)/account-rejected",
  },
  approved: {
    value: "approved",
    url: "/(tabs)",
  },
};
