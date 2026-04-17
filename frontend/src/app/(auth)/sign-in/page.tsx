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

export interface SignInFormData {
  email: string;
  password: string; // Optional if you don't always want to pass the hash
}

export default function SignUpPage() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const [termsAccept, setTermsAccept] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<SignInFormData>();

  const { mutate, isLoading } = useQueryMutation({
    isPublic: true,
    url: "/auth/login",
  });

  const onSubmit = handleSubmit(async (data: SignInFormData) => {
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
          Sign In
        </h1>
        <p className="text-gray-500 mb-10">
          Sign in to start ordering the most delicious food near you.
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

          <PasswordField
            label="Password"
            name="password"
            register={register}
            error={errors.password}
            required
          />

          <div className="flex justify-between items-center gap-1 ">
            <label
              htmlFor="remember"
              className="flex justify-start items-center gap-2 cursor-pointer"
              onClick={() => setTermsAccept(!termsAccept)}
            >
              <input type="checkbox" className="hidden peer" id="remember" />
              <div className="size-5 rounded-sm border border-red-700 peer-checked:bg-red-700 text-sm flex justify-center items-center text-transparent peer-checked:text-white">
                <Check />
              </div>
              <p>Remember me </p>
            </label>
            <Link
              href="/forgot-password"
              className="text-red-600 font-bold hover:text-red-700 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            rightIcon={<ArrowRight size={20} />}
            loading={isLoading}
          >
            Sign In
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

        <div className="mt-4 text-center text-gray-500 font-medium text-sm">
          Want to partner with us?{" "}
          <Link
            href="/restaurant-sign-up"
            className="text-red-600 font-bold hover:text-red-700 hover:underline"
          >
            Register your restaurant
          </Link>
        </div>

        <div className="mt-12 flex items-center">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="px-4 text-xs font-semibold text-gray-400 tracking-wider">
            OR CONTINUE WITH
          </span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <SocialLogin />
      </div>
    </AuthLayout>
  );
}
