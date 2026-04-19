import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
// @ts-ignore: side-effect CSS import declaration
import "./global.css";
import "react-native-reanimated";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/configs/query-client";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={getQueryClient()}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "white" },
          }}
        />
        <Toast />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
