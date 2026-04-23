"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { X, UtensilsCrossed, DollarSign, Tag, FileText, Image as ImageIcon, Camera } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/button";
import InputField from "@/components/form/InputField";
import { useQueryMutation } from "@/hooks/mutate/useQueryMutation";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  isAvailable: boolean;
  sortOrder: number;
}

interface MenuItemFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  isAvailable: boolean;
}

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  restaurantId: string;
  editItem?: MenuItem | null;
}

const CATEGORY_SUGGESTIONS = [
  "Appetizers",
  "Main Course",
  "Desserts",
  "Drinks",
  "Sides",
  "Salads",
  "Soups",
  "Specials",
  "Combo Meals",
  "Breakfast",
];

export default function AddMenuItemModal({
  isOpen,
  onClose,
  onSuccess,
  restaurantId,
  editItem,
}: AddMenuItemModalProps) {
  const isEditMode = !!editItem;
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { currencySymbol } = useCurrency();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MenuItemFormData>({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      isAvailable: true,
    },
  });

  const { mutate: createItem, isLoading: isCreating } = useQueryMutation({
    url: `/menu/${restaurantId}`,
    method: "POST",
  });

  const { mutate: updateItem, isLoading: isUpdating } = useQueryMutation({
    url: `/menu/${restaurantId}`,
    method: "PUT",
  });

  const { mutate: uploadImage } = useQueryMutation({
    url: "/cloudinary/upload",
    method: "POST",
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setUploadingImage(true);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        uploadImage(
          { buffer: base64 },
          {
            onSuccess: (data: any) => {
              setValue("image", data?.data?.url);
              setUploadingImage(false);
            },
            onError: (error: any) => {
              console.error(error);
              toast.error("Failed to upload image!");
              setUploadingImage(false);
            },
          }
        );
      };
    }
  };

  const isLoading = isCreating || isUpdating;
  const watchCategory = watch("category");
  const watchIsAvailable = watch("isAvailable");
  const imageUrl = watch("image");

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      setValue("name", editItem.name || "");
      setValue("description", editItem.description || "");
      setValue("price", editItem.price || "");
      setValue("category", editItem.category || "");
      setValue("image", editItem.image || "");
      setValue("isAvailable", editItem.isAvailable ?? true);
    } else {
      reset({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        isAvailable: true,
      });
    }
  }, [editItem, setValue, reset]);

  const onSubmit = handleSubmit((data) => {
    if (isEditMode && editItem) {
      updateItem(
        { ...data, updatedUrl: `/menu/${restaurantId}/${editItem.id}` },
        {
          onSuccess: () => {
            toast.success("Menu item updated!");
            onSuccess();
          },
        }
      );
    } else {
      createItem(data, {
        onSuccess: () => {
          toast.success("Menu item added!");
          onSuccess();
        },
      });
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        style={{
          animation: "fadeIn 0.2s ease-out",
        }}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-8 py-7 text-white relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <UtensilsCrossed size={24} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">
                  {isEditMode ? "Edit Menu Item" : "Add Menu Item"}
                </h2>
                <p className="text-red-100 text-sm font-medium">
                  {isEditMode
                    ? "Update item details"
                    : "Add a new dish to your menu"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form
          onSubmit={onSubmit}
          className="p-8 space-y-6 overflow-y-auto flex-1"
        >
          {/* Name */}
          <InputField
            label="Item Name"
            name="name"
            placeholder="e.g. Classic Cheeseburger"
            register={register}
            error={errors.name}
            required
            icon={UtensilsCrossed}
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <div className="absolute top-4 left-0 pl-4 pointer-events-none">
                <FileText size={18} className="text-gray-400" />
              </div>
              <textarea
                placeholder="Describe your dish — ingredients, taste, portion size..."
                rows={3}
                className="pl-11 w-full bg-gray-50 border border-gray-200 rounded-xl py-4 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                {...register("description")}
              />
            </div>
          </div>

          {/* Price and Category in a row */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label={`Price (${currencySymbol})`}
              name="price"
              type="number"
              placeholder="9.99"
              register={register}
              error={errors.price}
              required
              icon={DollarSign}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Tag size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Main Course"
                  className="pl-11 w-full bg-gray-50 border border-gray-200 rounded-xl py-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                  {...register("category")}
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {CATEGORY_SUGGESTIONS.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Category Quick Picks */}
          {!watchCategory && (
            <div className="flex flex-wrap gap-2">
              {CATEGORY_SUGGESTIONS.slice(0, 6).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setValue("category", cat)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 text-xs font-bold rounded-full transition-colors cursor-pointer"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Item Image</label>
            <div 
              onClick={() => imageInputRef.current?.click()}
              className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${
                imageUrl ? "border-gray-200" : "border-gray-300 hover:border-red-500 hover:bg-red-50"
              }`}
            >
              {uploadingImage ? (
                 <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-2"></div>
                    <span className="text-sm text-gray-500">Uploading...</span>
                 </div>
              ) : imageUrl ? (
                <>
                  <Image src={imageUrl} alt="Item Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="bg-white text-gray-900 p-2 rounded-lg flex items-center gap-2 text-sm font-medium">
                      <Camera size={16} /> Change Image
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-gray-500 p-4 text-center">
                  <Camera size={28} className="mb-2 text-gray-400" />
                  <span className="font-medium text-sm">Click to upload image</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                </div>
              )}
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Available for ordering
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Customers can see and order this item
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                {...register("isAvailable")}
              />
              <div
                className={`w-12 h-7 rounded-full transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:start-[3px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:duration-300 after:shadow-sm ${
                  watchIsAvailable
                    ? "bg-green-500 after:translate-x-5"
                    : "bg-gray-300"
                }`}
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-gray-200 py-4 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              className="flex-1 rounded-xl py-4 font-bold shadow-lg shadow-red-200"
            >
              {isEditMode ? "Update Item" : "Add Item"}
            </Button>
          </div>
        </form>
      </div>

      {/* Inline Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
