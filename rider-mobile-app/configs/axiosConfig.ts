
import axios, { AxiosInstance } from "axios";
import { API_BASE_URL, TOKEN_NAME } from ".";
import { storage } from "./storage";

export const publicInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "mobile-app-key": process.env.EXPO_PUBLIC_MOBILE_APP_KEY || 1234567890,
  },
});

publicInstance.interceptors.request.use(async (config) => {
  // const token = await getToken(); // from storage
  // if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  }
  return config;
});

export const privateInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "mobile-app-key": process.env.EXPO_PUBLIC_MOBILE_APP_KEY || 1234567890,
  },
  withCredentials: true,
});

// Request interceptor
privateInstance.interceptors.request.use(
  async (config) => {
    // Attach token
    const token = storage.getString(TOKEN_NAME ?? "token");
    console.log("Token:", token);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
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

    return Promise.reject(error);
  },
);

// Utility to update Authorization header dynamically
export const updatePrivateAxiosInstance = (token: string) => {
  privateInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};