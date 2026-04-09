"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowRight, Check, UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signUp } from "@/utils/api";
import InputField from "@/components/form/InputField";
import PasswordField from "@/components/form/passwordField";
import apple from "@/../public/apple.svg";
import google from "@/../public/google.svg";
import Button from "@/components/ui/button";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { toast } from "sonner";

export interface SignInFormData {
  email: string;
  password: string; // Optional if you don't always want to pass the hash
}

export default function SignUpPage() {
  const router = useRouter();
  const [termsAccept, setTermsAccept] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<SignInFormData>();

  const { mutate, isLoading, backendErrors } = useQueryMutation({
    isPublic: true,
    url: "/auth/login",
  });

  const onSubmit = handleSubmit(async (data: SignInFormData) => {
    console.log(data);

    console.log(process.env.NEXT_PUBLIC_API_BASE_URL);

    mutate(data, {
      onSuccess: () => {
        toast.success("Login Success");

        router.push("/profile");
      },
    });
  });

  return (
    <main className="">
      <section className="container min-h-screen">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 py-6 lg:col-span-5">
            <div className="flex h-full flex-col items-start justify-between gap-8 sm:gap-10 lg:gap-20">
              <Link
                href="/"
                className=" flex items-center gap-2 group z-10 w-fit"
              >
                <div className="bg-red-600 group-hover:bg-red-700 text-white size-9  rounded-xl font-bold text-xl tracking-tight transition-colors flex justify-center items-center">
                  <span>T</span>
                </div>
                <span className="font-extrabold text-2xl tracking-tight text-gray-900 group-hover:text-red-700 transition-colors">
                  Tomato.
                </span>
              </Link>
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

                  <div className="flex justify-start items-center gap-1 ">
                    <label
                      htmlFor="remember"
                      className="flex justify-start items-center gap-2 cursor-pointer"
                      onClick={() => setTermsAccept(!termsAccept)}
                    >
                      <input
                        type="checkbox"
                        className="hidden peer"
                        id="remember"
                      />
                      <div className="size-5 rounded-sm border border-red-700 peer-checked:bg-red-700 text-sm flex justify-center items-center text-transparent peer-checked:text-white">
                        <Check />
                      </div>
                      <p>Remember me </p>
                    </label>
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
                    href="/signup"
                    className="text-red-600 font-bold hover:text-red-700 hover:underline"
                  >
                    Sign Up
                  </Link>
                </div>

                <div className="mt-12 flex items-center">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="px-4 text-xs font-semibold text-gray-400 tracking-wider">
                    OR CONTINUE WITH
                  </span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 text-sm font-bold">
                  <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                    <Image src={google} className="" alt="google" />
                    Google
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                    <Image src={apple} className="" alt="apple" />
                    Apple
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="2xl:col-starts-8 relative col-span-6 max-lg:hidden lg:ml-20">
            <div className="fixed top-0 right-0 bottom-0 w-1/2">
              <div className="absolute inset-0 m-4 rounded-[2.5rem] overflow-hidden">
                <div className=" bg-linear-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                <Image
                  src="/hero-bg.png"
                  alt="Sign up delicious background"
                  fill
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute bottom-16 left-16 right-16 z-20 text-white bg-black/70 rounded-2xl p-6">
                  <h2 className="text-4xl font-extrabold mb-4 leading-tight">
                    Join thousands of foodies today.
                  </h2>
                  <p className="text-lg text-gray-300 font-medium">
                    Get exclusive access to the best restaurants in town, track
                    your orders in real-time, and earn rewards points with every
                    meal.
                  </p>

                  <div className="flex items-center gap-4 mt-8">
                    <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-300 overflow-hidden">
                        <Image
                          src="/burger.png"
                          width={40}
                          height={40}
                          alt="user"
                          className="object-cover"
                        />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-400 overflow-hidden">
                        <Image
                          src="/pizza.png"
                          width={40}
                          height={40}
                          alt="user"
                          className="object-cover"
                        />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-500 overflow-hidden">
                        <Image
                          src="/sushi.png"
                          width={40}
                          height={40}
                          alt="user"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <p className="font-semibold text-sm">Join 10,000+ others</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
