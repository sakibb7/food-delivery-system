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

export interface OwnerSignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  city?: string;
  country?: string;
  zipcode?: string;
  termsAccept: boolean;
}

export default function OwnerSignUpPage() {
  const router = useRouter();
  const [termsAccept, setTermsAccept] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<OwnerSignUpFormData>();

  const { mutate, isLoading, backendErrors } = useQueryMutation({
    isPublic: true,
    url: "/auth/register/restaurant",
  });

  const onSubmit = handleSubmit(async (data: OwnerSignUpFormData) => {
    // if (!termsAccept) {
    //   toast.error("Please accept the terms and conditions");
    //   return;
    // }
    mutate(data, {
      onSuccess: () => {
        toast.success("Business Account Created Successfully!");
        router.push("/dashboard");
      },
      onError: (error) => {
        console.log(backendErrors, "Backend Error");
        console.log(error, "Error");
      },
    });
  });

  return (
    <AuthLayout>
      <div className="max-w-md w-full mx-auto sm:mx-0 mt-16 lg:mt-0">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Partner with us
        </h1>
        <p className="text-gray-500 mb-10">
          Create a business account to manage your restaurant and orders.
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
            label="Business Email"
            placeholder="contact@restaurant.com"
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
            <label
              htmlFor="remember"
              className="flex justify-start items-center gap-2 cursor-pointer"
              onClick={() => setTermsAccept(!termsAccept)}
            >
              <input type="checkbox" className="hidden peer" id="remember" />
              <div className="size-5 rounded-sm border border-red-700 peer-checked:bg-red-700 text-sm flex justify-center items-center text-transparent peer-checked:text-white">
                <Check />
              </div>
              <p>I agree to the </p>
            </label>
            <Link href="" className="text-red-700 hover:underline font-medium">
              Business Terms & Conditions
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            rightIcon={<ArrowRight size={20} />}
            loading={isLoading}
          >
            Create Business Account
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
      </div>
    </AuthLayout>
  );
}
