import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
// @ts-ignore: side-effect CSS import declaration
import "./global.css";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
        }}
      />
    </>
  );
}
