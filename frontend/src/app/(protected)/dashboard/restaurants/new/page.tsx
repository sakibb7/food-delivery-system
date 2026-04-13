"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Store, 
  MapPin, 
  Clock, 
  DollarSign, 
  FileText, 
  Tag, 
  Image as ImageIcon,
  CheckCircle2
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
  minOrder: string;
  deliveryFee: string;
  bannerUrl?: string;
}

export default function NewRestaurantPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RestaurantFormData>();

  const { mutate, isLoading } = useQueryMutation({
    url: "/restaurants",
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
                name="minOrder"
                placeholder="e.g. $10"
                register={register}
                error={errors.minOrder}
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
              <h2 className="text-xl font-bold">Restaurant Banner</h2>
            </div>
            <InputField
                label="Banner Image URL"
                name="bannerUrl"
                placeholder="https://images.unsplash.com/photo..."
                register={register}
                error={errors.bannerUrl}
                icon={ImageIcon}
              />
              <p className="mt-2 text-xs text-gray-400 font-medium">Use a high-quality landscape image for better visibility.</p>
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
