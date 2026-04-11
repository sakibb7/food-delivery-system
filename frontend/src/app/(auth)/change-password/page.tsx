"use client";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import InputField from "@/components/form/InputField";
import PasswordField from "@/components/form/passwordField";

import Button from "@/components/ui/button";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { toast } from "sonner";
import SocialLogin from "@/components/ui/SocialLogin";
import AuthLayout from "@/components/layout/auth-layout";
import { useAuthStore } from "@/store/auth";

export interface ChangePasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const [termsAccept, setTermsAccept] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<ChangePasswordFormData>();

  const { mutate, isLoading } = useQueryMutation({
    isPublic: true,
    url: "/auth/login",
  });

  const onSubmit = handleSubmit(async (data: ChangePasswordFormData) => {
    mutate(data, {
      onSuccess: (data) => {
        const user = data?.data?.data?.user;
        if (user) {
          login(user);
        } else {
          toast.info("User data not found!");
        }

        toast.success("Login Success");

        router.push("/profile");
      },
    });
  });

  return (
    <AuthLayout>
      <div className="max-w-md w-full mx-auto sm:mx-0 mt-16 lg:mt-0">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Change Password
        </h1>
        <p className="text-gray-500 mb-10">
          Change your password to keep your account secure.
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <PasswordField
            label="Password"
            name="password"
            register={register}
            error={errors.password}
            required
          />

          <PasswordField
            label="Confirm Password"
            name="confirmPassword"
            register={register}
            watch={watch}
            compareWith="password"
            error={errors.confirmPassword}
            required
          />

          <Button
            type="submit"
            fullWidth
            rightIcon={<ArrowRight size={20} />}
            loading={isLoading}
          >
            Save Changes
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
