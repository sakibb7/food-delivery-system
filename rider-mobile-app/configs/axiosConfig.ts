import axios, { AxiosInstance } from "axios";
import { router } from "expo-router";
import { API_BASE_URL, MAINTENANCE } from ".";
import { storage } from "./storage";

export const publicInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "mobile-app-key": process.env.EXPO_PUBLIC_MOBILE_APP_KEY,
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

publicInstance.interceptors.request.use(async (config) => {
  // const token = await getToken(); // from storage
  // if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

export const privateInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "mobile-app-key": process.env.EXPO_PUBLIC_MOBILE_APP_KEY,
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Request interceptor
privateInstance.interceptors.request.use(
  async (config) => {
    // Attach token
    const token = storage.getString(process.env.EXPO_PUBLIC_TOKEN_NAME ?? "token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
privateInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    console.log("❌ Axios Error");
    console.log("URL:", error?.config?.baseURL + error?.config?.url);
    console.log("Method:", error?.config?.method);
    console.log("Status:", status);
    console.log("Response:", error?.response?.data);
    if (status === 401) {
      storage.remove(process.env.EXPO_PUBLIC_TOKEN_NAME ?? "token");
      router.replace("/(auth)/sign-in");
    } else if (status === 503) {
      storage.remove(process.env.EXPO_PUBLIC_TOKEN_NAME ?? "token");
      storage.set(MAINTENANCE, "true");
      router.replace("/");
    } else if ([400, 403, 404, 500, 200, 201].includes(status)) {
      const maintenance = storage.getString(MAINTENANCE);
      if (maintenance) storage.remove(MAINTENANCE);
    }

    return Promise.reject(error);
  },
);

// Utility to update Authorization header dynamically
export const updatePrivateAxiosInstance = (token: string) => {
  privateInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};
