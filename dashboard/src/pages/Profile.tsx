import { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/app-context";
import type { AppContextType } from "../types";
import { User, Mail, Phone, Shield, Save } from "lucide-react";
import { toast } from "sonner";
import { useQueryMutation } from "../hooks/mutate/useQueryMutation";

export default function Profile() {
  const { user, setUser } = useContext(AppContext) as AppContextType;

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: (user as any)?.phone || "",
    role: user?.adminRole?.name || user?.role || "Admin",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        role: user.adminRole?.name || user.role || "Admin",
      });
    }
  }, [user]);

  const { mutate, isLoading: isSubmitting } = useQueryMutation({
    url: "/user/me",
    method: "PATCH",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      { firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone },
      {
        onSuccess: (res) => {
          toast.success("Profile updated successfully!");
          if (setUser && res?.data?.data?.user) {
            setUser(res.data.data.user);
          }
        },
        onError: (err: any) => {
          toast.error(err?.data?.message || err?.message || "Failed to update profile");
        }
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-3xl border-4 border-white shadow-md">
              {formData.firstName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {formData.firstName} {formData.lastName}
              </h2>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <Shield className="h-4 w-4" />
                <span>{formData.role}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Enter first name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Enter last name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
