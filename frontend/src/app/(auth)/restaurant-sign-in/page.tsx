"use client";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowRight, Check, Store } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import InputField from "@/components/form/InputField";
import PasswordField from "@/components/form/passwordField";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import SocialLogin from "@/components/ui/SocialLogin";
import AuthLayout from "@/components/layout/auth-layout";
import { useAuthStore } from "@/store/auth";

export interface RestaurantSignInFormData {
  email: string;
  password: string;
}

export default function RestaurantSignInPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<RestaurantSignInFormData>();

  const { mutate, isLoading } = useQueryMutation({
    isPublic: true,
    url: "/auth/login",
  });

  const onSubmit = handleSubmit(async (data: RestaurantSignInFormData) => {
    mutate(data, {
      onSuccess: (response) => {
        const user = response?.data?.data?.user;
        if (user) {
          login(user);
          toast.success("Business Login Successful!");
          router.push("/dashboard");
        } else {
          toast.error("User data not found!");
        }
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Login failed. Please check your credentials.");
      },
    });
  });

  return (
    <AuthLayout
      title="Grow your business with Tekina."
      description="Join thousands of restaurants and reach more customers than ever before. Manage everything from one dashboard."
      statsText="5,000+ restaurant partners"
    >
      <div className="max-w-md w-full mx-auto sm:mx-0 mt-16 lg:mt-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-red-100 p-2 rounded-lg">
            <Store className="text-red-700 size-5" />
          </div>
          <span className="text-red-700 font-bold text-sm tracking-wider uppercase">
            Partner Portal
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Business Login
        </h1>
        <p className="text-gray-500 mb-10">
          Welcome back! Manage your restaurant and orders with ease.
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <InputField
            label="Business Email"
            placeholder="manager@restaurant.com"
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

          <div className="flex justify-between items-center ">
            <label
              htmlFor="remember"
              className="flex justify-start items-center gap-2 cursor-pointer group"
              onClick={() => setRememberMe(!rememberMe)}
            >
              <input type="checkbox" className="hidden peer" id="remember" />
              <div className="size-5 rounded-md border-2 border-gray-300 peer-checked:border-red-700 peer-checked:bg-red-700 text-sm flex justify-center items-center text-transparent peer-checked:text-white transition-all duration-200">
                <Check className="size-3.5 stroke-[3px]" />
              </div>
              <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                Remember me
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-red-700 hover:text-red-800 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            rightIcon={<ArrowRight size={20} />}
            loading={isLoading}
            className="h-12 text-base font-bold shadow-lg shadow-red-200"
          >
            Login to Dashboard
          </Button>
        </form>

        <div className="mt-8 text-center text-gray-500 font-medium text-sm">
          Don&apos;t have a business account?
          <Link
            href="/restaurant-sign-up"
            className="text-red-600 font-bold hover:text-red-700 hover:underline ml-1"
          >
            Register your restaurant
          </Link>
        </div>

        <div className="mt-8 flex items-center">
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
