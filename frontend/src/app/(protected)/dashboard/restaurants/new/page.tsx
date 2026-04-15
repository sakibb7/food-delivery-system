"use client";
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  DollarSign,
  FileText,
  Tag,
  Image as ImageIcon,
  CheckCircle2,
  Camera,
  Upload
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import InputField from "@/components/form/InputField";
import Button from "@/components/ui/button";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";

export interface RestaurantFormData {
  name: string;
  description: string;
  cuisine: string;
  address: string;
  city: string;
  country: string;
  zipcode: string;
  deliveryTime: string;
  minOrderAmount: string;
  deliveryFee: string;
  logo?: string;
  coverImage?: string;
}

export default function NewRestaurantPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RestaurantFormData>();

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadImage } = useQueryMutation({
    url: "/cloudinary/upload",
    method: "POST",
  });

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "coverImage"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      if (type === "logo") setUploadingLogo(true);
      else setUploadingCover(true);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        uploadImage(
          { buffer: base64 },
          {
            onSuccess: (data: any) => {
              setValue(type, data?.data?.url);
              if (type === "logo") setUploadingLogo(false);
              else setUploadingCover(false);
            },
            onError: (error: any) => {
              console.error(error);
              toast.error("Failed to upload image!");
              if (type === "logo") setUploadingLogo(false);
              else setUploadingCover(false);
            },
          }
        );
      };
    }
  };

  const logoUrl = watch("logo");
  const coverImageUrl = watch("coverImage");

  const { mutate, isLoading } = useQueryMutation({
    url: "/restaurant",
    isPublic: false,
  });

  const onSubmit = handleSubmit((data) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Restaurant added successfully!");
        router.push("/dashboard");
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Something went wrong!");
      },
    });
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-red-600 px-8 py-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
              <Store size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Add New Restaurant</h1>
              <p className="text-red-100 font-medium">Register your store and start reaching customers.</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-8 lg:p-12 space-y-10">
          {/* Basic Information */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-gray-900">
              <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                <FileText size={18} />
              </div>
              <h2 className="text-xl font-bold">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Restaurant Name"
                name="name"
                placeholder="e.g. The Gourmet Burger"
                register={register}
                error={errors.name}
                required
                icon={Store}
              />
              <InputField
                label="Cuisine Type"
                name="cuisine"
                placeholder="e.g. American, Burger"
                register={register}
                error={errors.cuisine}
                required
                icon={Tag}
              />
              <div className="md:col-span-2">
                <InputField
                  label="Description"
                  name="description"
                  placeholder="Tell customers about your awesome food..."
                  register={register}
                  error={errors.description}
                  required
                  icon={FileText}
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Location Details */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-gray-900">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <h2 className="text-xl font-bold">Location Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField
                  label="Full Address"
                  name="address"
                  placeholder="e.g. 123 Main St, New York"
                  register={register}
                  error={errors.address}
                  required
                  icon={MapPin}
                />
              </div>
              <InputField
                label="City"
                name="city"
                placeholder="e.g. New York"
                register={register}
                error={errors.city}
                required
              />
              <InputField
                label="Country"
                name="country"
                placeholder="e.g. USA"
                register={register}
                error={errors.country}
                required
              />
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Operational Details */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-gray-900">
              <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <Clock size={18} />
              </div>
              <h2 className="text-xl font-bold">Operational Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Delivery Time"
                name="deliveryTime"
                placeholder="e.g. 20-30 min"
                register={register}
                error={errors.deliveryTime}
                required
                icon={Clock}
              />
              <InputField
                label="Min Order Amount"
                name="minOrderAmount"
                placeholder="e.g. $10"
                register={register}
                error={errors.minOrderAmount}
                required
                icon={DollarSign}
              />
              <InputField
                label="Delivery Fee"
                name="deliveryFee"
                placeholder="e.g. $2.99"
                register={register}
                error={errors.deliveryFee}
                required
                icon={DollarSign}
              />
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Media */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-gray-900">
              <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                <ImageIcon size={18} />
              </div>
              <h2 className="text-xl font-bold">Restaurant Images</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Restaurant Logo</label>
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${
                    logoUrl ? "border-gray-200" : "border-gray-300 hover:border-red-500 hover:bg-red-50"
                  }`}
                >
                  {uploadingLogo ? (
                     <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-2"></div>
                        <span className="text-sm text-gray-500">Uploading...</span>
                     </div>
                  ) : logoUrl ? (
                    <>
                      <Image src={logoUrl} alt="Logo Preview" fill className="object-contain p-4" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="bg-white text-gray-900 p-2 rounded-lg flex items-center gap-2 text-sm font-medium">
                          <Camera size={16} /> Change Logo
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-500 p-4 text-center">
                      <Camera size={32} className="mb-2 text-gray-400" />
                      <span className="font-medium">Click to upload logo</span>
                      <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={(e) => handleFileUpload(e, "logo")}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Cover Image (Banner)</label>
                <div 
                  onClick={() => coverInputRef.current?.click()}
                  className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${
                    coverImageUrl ? "border-gray-200" : "border-gray-300 hover:border-red-500 hover:bg-red-50"
                  }`}
                >
                  {uploadingCover ? (
                     <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-2"></div>
                        <span className="text-sm text-gray-500">Uploading...</span>
                     </div>
                  ) : coverImageUrl ? (
                    <>
                      <Image src={coverImageUrl} alt="Cover Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="bg-white text-gray-900 p-2 rounded-lg flex items-center gap-2 text-sm font-medium">
                          <Upload size={16} /> Change Cover
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-500 p-4 text-center">
                      <Upload size={32} className="mb-2 text-gray-400" />
                      <span className="font-medium">Click to upload cover</span>
                      <span className="text-xs text-gray-400 mt-1">Wide image, PNG, JPG up to 5MB</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={(e) => handleFileUpload(e, "coverImage")}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="pt-6">
            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              size="lg"
              rightIcon={<CheckCircle2 size={22} />}
              className="py-5 text-xl tracking-tight"
            >
              Add Restaurant Profile
            </Button>
            <p className="text-center text-gray-400 mt-6 text-sm font-medium">
              By adding a restaurant, you agree to our <Link href="#" className="text-red-600 hover:underline">Partner Terms of Service</Link>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
