"use client";

import React, { useState, useRef } from "react";
import { User, Lock, Bell, Settings, Camera, Save, LogOut, MapPin, Plus, Home, Briefcase, Building2, ChevronRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { useGetQuery } from "@/hooks/mutate/useGetQuery";
import { getQueryClient } from "@/configs/query-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import InputField from "@/components/form/InputField";
import PasswordField from "@/components/form/passwordField";
import PhoneInputField from "@/components/form/PhoneInputField";

interface SavedAddress {
  id: number;
  label: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  zipcode: string | null;
  isDefault: boolean;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

type changePasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  // Fetch saved addresses for the addresses tab
  const { data: addressesData, isLoading: addressesLoading } = useGetQuery<{ addresses: SavedAddress[] }>({
    url: "/address",
    queryKey: "addresses",
  });
  const savedAddresses = addressesData?.addresses || [];

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "1736675508",
    },
  });

  const {
    register: registerChangePassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    formState: { errors: changePasswordErrors },
  } = useForm<changePasswordData>();

  const { mutate: changePassword } = useQueryMutation({
    url: "/user/password",
    method: "PUT",
  });

  const { mutate } = useQueryMutation({
    url: "/auth/logout",
  });

  const {
    mutate: updateProfile,
    isLoading,
    backendErrors,
  } = useQueryMutation({
    isPublic: false,
    url: "/user/profile",
    method: "PUT",
  });

  const { mutate: uploadImage, isLoading: isUploading } = useQueryMutation({
    url: "/cloudinary/upload",
    method: "POST",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        uploadImage(
          { buffer: base64 },
          {
            onSuccess: (data: any) => {
              console.log(data?.data?.url)

              updateProfile(
                { avatar: data?.data?.url },
                {
                  onSuccess: () => {
                    toast.success("Avatar Updated Successfully!");
                    getQueryClient().invalidateQueries();
                  },
                  onError: () => {
                    toast.error("Failed to update profile with new avatar!");
                  },
                },
              );
            },
            onError: (error: any) => {
              console.error(error);
              toast.error("Failed to upload image!");
            },
          },
        );
      };
    }
  };

  const signOut = () => {
    mutate(
      {},
      {
        onSuccess: () => {
          getQueryClient().invalidateQueries();
          router.push("/sign-in");
          toast.success("Logout Successfully!");
        },
        onError: (data) => {
          console.log(data.error);
          toast.error("Something went wrong!");
        },
      },
    );
  };

  const onSubmit = handleSubmit(async (data: ProfileFormData) => {
    updateProfile(data, {
      onSuccess: () => {
        toast.success("Account Updated Successfully!");
      },
      onError: (error) => {
        console.log(backendErrors, "Backend Error");
        console.log(error, "Error");
        toast.error("Failed to update profile!");
      },
    });
  });

  const onChangePasswordSubmit = handlePasswordSubmit((data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }

    changePassword(data, {
      onSuccess: () => {
        toast.success("Password Updated Successfully!");
      },
      onError: (error) => {
        console.log(error, "Change Password Error");
        toast.error("Failed to update password!");
      },
    });
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          Manage your profile, security, and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
              <div
                onClick={handleAvatarClick}
                className="w-24 h-24 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 relative group cursor-pointer border-4 border-white shadow-sm overflow-hidden"
              >
                {isUploading ? (
                  <div className="flex items-center justify-center w-full h-full bg-black/10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  </div>
                ) : user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold">
                    {user
                      ? user?.firstName?.charAt(0) + user?.lastName?.charAt(0)
                      : "JD"}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <h2 className="font-bold text-gray-900 text-lg">
                {user?.firstName + " " + user?.lastName || "John Doe"}
              </h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>

            <nav className="p-3 space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "profile" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <User size={20} /> Personal Info
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "security" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <Lock size={20} /> Security
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "notifications" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <Bell size={20} /> Notifications
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "addresses" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <MapPin size={20} /> Delivery Addresses
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "settings" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <Settings size={20} /> Preferences
              </button>
            </nav>

            <div className="p-3 mt-4 border-t border-gray-100">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} /> Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 min-h-125">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Personal Information
                </h2>
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputField
                      label="First Name"
                      placeholder="John"
                      name="firstName"
                      register={register}
                      error={errors.firstName}
                      required
                    />
                    <InputField
                      label="Last Name"
                      placeholder="Doe"
                      name="lastName"
                      register={register}
                      error={errors.lastName}
                      required
                    />
                  </div>
                  <InputField
                    label="Email"
                    placeholder="johndoe@gmail.com"
                    name="email"
                    register={register}
                    error={errors.email}
                    required
                  />

                  <PhoneInputField
                    label="Phone Number"
                    name="phone"
                    control={control}
                    error={errors.phone}
                    required
                  />

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-600/30">
                      <Save size={18} /> Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Security & Password
                </h2>
                <form onSubmit={onChangePasswordSubmit} className="space-y-6">
                  <PasswordField
                    label=" Current Password"
                    name="currentPassword"
                    register={registerChangePassword}
                    error={changePasswordErrors.currentPassword}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <PasswordField
                      label="New Password"
                      name="newPassword"
                      register={registerChangePassword}
                      error={changePasswordErrors.newPassword}
                      required
                    />
                    <PasswordField
                      label="Confirm New Password"
                      name="confirmNewPassword"
                      register={registerChangePassword}
                      watch={watch}
                      compareWith="newPassword"
                      error={changePasswordErrors.confirmNewPassword}
                      required
                    />
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-colors">
                      Update Password
                    </button>
                  </div>

                  <div className="mt-10 p-5 bg-red-50 border border-red-100 rounded-2xl">
                    <h3 className="font-bold text-red-900 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>
                    <button className="px-4 py-2 bg-white text-red-600 border border-red-200 shadow-sm rounded-xl font-bold hover:bg-red-50 transition-colors text-sm">
                      Delete My Account
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Notification Preferences
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <div>
                      <h3 className="font-bold text-gray-900">Order Updates</h3>
                      <p className="text-sm text-gray-500">
                        Get notified when your order status changes.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Promotions & Offers
                      </h3>
                      <p className="text-sm text-gray-500">
                        Receive emails about new discounts and deals.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Restaurant Recommendations
                      </h3>
                      <p className="text-sm text-gray-500">
                        Weekly suggestions based on your taste.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivery Addresses
                  </h2>
                  <Link
                    href="/addresses"
                    className="flex items-center gap-1.5 text-red-600 font-semibold text-sm hover:text-red-700 transition-colors"
                  >
                    Manage All <ChevronRight size={16} />
                  </Link>
                </div>

                {addressesLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 animate-pulse">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-200" />
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-48" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : savedAddresses.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                    <MapPin size={40} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">No saved addresses</h3>
                    <p className="text-gray-500 text-sm mb-6">Add your delivery locations for faster checkout.</p>
                    <Link
                      href="/addresses"
                      className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                    >
                      <Plus size={16} /> Add Address
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedAddresses.map((addr) => {
                      const iconMap: Record<string, React.ElementType> = { Home, Work: Briefcase, Other: Building2 };
                      const AddrIcon = iconMap[addr.label] || Building2;

                      return (
                        <div
                          key={addr.id}
                          className={`flex items-start gap-4 p-4 border rounded-2xl transition-all ${addr.isDefault
                              ? "border-red-200 bg-red-50/50"
                              : "border-gray-100 bg-gray-50/50 hover:border-gray-200"
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${addr.isDefault ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-600"
                            }`}>
                            <AddrIcon size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900 text-sm">{addr.label}</h3>
                              {addr.isDefault && (
                                <span className="bg-red-600 text-white text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm truncate">{addr.address}</p>
                            <p className="text-gray-400 text-xs mt-0.5">
                              {addr.city}{addr.country ? `, ${addr.country}` : ""}
                              {addr.zipcode ? ` - ${addr.zipcode}` : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    <Link
                      href="/addresses"
                      className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50/50 transition-all font-semibold text-sm"
                    >
                      <Plus size={16} /> Add New Address
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  App Preferences
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Language
                    </label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-gray-50 appearance-none font-medium">
                      <option>English (US)</option>
                      <option>Bengali</option>
                      <option>Spanish</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Currency
                    </label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-gray-50 appearance-none font-medium">
                      <option>USD ($)</option>
                      <option>BDT (৳)</option>
                      <option>EUR (€)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
