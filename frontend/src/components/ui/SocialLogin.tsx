import Image from "next/image";
import apple from "@/../public/apple.svg";
import google from "@/../public/google.svg";

export default function SocialLogin() {
  const handleGoogleLogin = () => {
    // Redirect the entire browser window to the backend endpoint
    // Make sure to replace localhost:5000 with your actual backend URL variable
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/google`;
  };
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 text-sm font-bold">
      <button
        onClick={handleGoogleLogin}
        className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-3 text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Image src={google} className="" alt="google" />
        Google
      </button>
      <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-3 text-gray-700 hover:bg-gray-50 transition-colors">
        <Image src={apple} className="" alt="apple" />
        Apple
      </button>
    </div>
  );
}
