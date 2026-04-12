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

export interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPassword() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const [termsAccept, setTermsAccept] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<ForgotPasswordFormData>();

  const { mutate, isLoading } = useQueryMutation({
    isPublic: true,
    url: "/auth/password/forgot",
  });

  const onSubmit = handleSubmit(async (data: ForgotPasswordFormData) => {
    mutate(data, {
      onSuccess: (data) => {
        console.log(data, "forgot password data");
        toast.success(data?.data?.message || "Reset link sent to your email!");
      },
    });
  });

  return (
    <AuthLayout>
      <div className="max-w-md w-full mx-auto sm:mx-0 mt-16 lg:mt-0">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-gray-500 mb-10">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <InputField
            label="Email"
            placeholder="johndoe@gmail.com"
            name="email"
            register={register}
            error={errors.email}
            icon={Mail}
            required
          />

          <Button
            type="submit"
            fullWidth
            rightIcon={<ArrowRight size={20} />}
            loading={isLoading}
          >
            Send Reset Link
          </Button>
        </form>

        <div className="mt-8 text-center text-gray-500 font-medium text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-red-600 font-bold hover:text-red-700 hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
