import { SignUpFormData } from "@/app/(auth)/sign-up/page";
import { publicInstance } from "@/configs/axiosConfig";

export const signUp = async (data: SignUpFormData) => {
  const res = await publicInstance.post("/auth/register", data);
  return res;
};
