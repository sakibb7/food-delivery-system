import Toast from "react-native-toast-message";

export const showToast = ({ text, type }: { text: string; type: "success" | "error" | "info" }) => {
  Toast.show({
    visibilityTime: 2000,
    type,
    text1: text,
  });
};
