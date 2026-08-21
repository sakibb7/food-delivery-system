"use client";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowRight, Check, UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import InputField from "@/components/form/InputField";
import PasswordField from "@/components/form/passwordField";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import SocialLogin from "@/components/ui/SocialLogin";
import AuthLayout from "@/components/layout/auth-layout";
import PhoneInputField from "@/components/form/PhoneInputField";

export interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string; // Optional if you don't always want to pass the hash
  confirmPassword?: string; // Usually only needed during registration/DTOs
  phone?: string;
  avatar?: string;
  address?: string;
  city?: string;
  country?: string;
  zipcode?: string;
  termsAccept: boolean;
}

export default function SignUpPage() {
  const router = useRouter();
  const [termsAccept, setTermsAccept] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
    watch,
  } = useForm<SignUpFormData>();

  const { mutate, isLoading, backendErrors } = useQueryMutation({
    isPublic: true,
    url: "/auth/register",
  });

  const onSubmit = handleSubmit(async (data: SignUpFormData) => {
    if (!termsAccept) {
      toast.error("Please accept the terms and conditions");
      return;
    }
    mutate(data, {
      onSuccess: () => {
        toast.success("Account Created Successfully!");
        router.push("/dashboard");
      },
      onError: (error) => {
        console.log(error, "Error");
      },
    });
  });

  return (
    <AuthLayout>
      <div className="max-w-md w-full mx-auto sm:mx-0 mt-16 lg:mt-0">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Create an account
        </h1>
        <p className="text-gray-500 mb-10">
          Sign up to start ordering the most delicious food near you.
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <InputField
            label="First Name"
            placeholder="John"
            name="firstName"
            register={register}
            error={errors.firstName}
            icon={UserIcon}
            required
          />
          <InputField
            label="Last Name"
            placeholder="Doe"
            name="lastName"
            register={register}
            error={errors.lastName}
            icon={UserIcon}
            required
          />
          <InputField
            label="Email"
            placeholder="johndoe@gmail.com"
            name="email"
            register={register}
            error={errors.email}
            icon={Mail}
            required
          />

          <PhoneInputField
            label="Phone Number"
            name="phone"
            control={control}
            error={errors.phone}
            required
          />

          <PasswordField
            label="Password"
            name="password"
            register={register}
            error={errors.password}
            isRegisterPage={true}
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

          <div className="flex justify-start items-center gap-1 ">
            <div
              className="flex justify-start items-center gap-2 cursor-pointer group"
              onClick={() => setTermsAccept(!termsAccept)}
            >
              <input type="checkbox" className="hidden peer" id="user-terms" checked={termsAccept} onChange={() => {}} />
              <div className="size-5 rounded-md border-2 border-gray-300 peer-checked:border-red-700 peer-checked:bg-red-700 text-sm flex justify-center items-center text-transparent peer-checked:text-white transition-all duration-200">
                <Check className="size-3.5 stroke-[3px]" />
              </div>
              <p className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">I agree to Tekina</p>
            </div>
            <Link href="/terms" className="text-sm font-semibold text-red-700 hover:text-red-800 hover:underline transition-colors ml-1">
              Terms & Conditions
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            rightIcon={<ArrowRight size={20} />}
            loading={isLoading}
          >
            Sign Up
          </Button>
        </form>

        <div className="mt-8 text-center text-gray-500 font-medium text-sm">
          Already have an account?
          <Link
            href="/sign-in"
            className="text-red-600 font-bold hover:text-red-700 hover:underline ml-1"
          >
            Log in
          </Link>
        </div>

        <div className="mt-4 text-center text-gray-500 font-medium text-sm">
          Want to partner with us?{" "}
          <Link
            href="/restaurant/sign-up"
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
