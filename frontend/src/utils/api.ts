import { SignUpFormData } from "@/app/signup/page";
import { publicInstance } from "@/configs/axiosConfig";

export const signUp = async (data: SignUpFormData) => {
  const res = await publicInstance.post("/auth/register", data);
  return res;
};
