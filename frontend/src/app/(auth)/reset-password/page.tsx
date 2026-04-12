"use client";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordField from "@/components/form/passwordField";
import Button from "@/components/ui/button";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { toast } from "sonner";
import AuthLayout from "@/components/layout/auth-layout";

export interface ChangePasswordFormData {
  password: string;
  confirmPassword: string;
  verificationCode: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<ChangePasswordFormData>();

  const { mutate, isLoading } = useQueryMutation({
    isPublic: true,
    url: "/auth/password/reset",
  });

  const onSubmit = handleSubmit(async (data: ChangePasswordFormData) => {
    mutate(
      { verificationCode: token, password: data.password },
      {
        onSuccess: (data) => {
          toast.success(data?.data?.message || "Password changed successfully");

          router.push("/sign-in");
        },
      },
    );
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
