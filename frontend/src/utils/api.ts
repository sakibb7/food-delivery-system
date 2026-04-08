import { SignUpFormData } from "@/app/signup/page";
import { publicInstance } from "@/configs/axiosConfig";

export const signUp = async (data: SignUpFormData) =>
  publicInstance.post("/auth/register", data);
