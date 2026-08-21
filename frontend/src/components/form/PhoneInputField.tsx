"use client";
import {
  Control,
  Controller,
  FieldError,
  FieldValues,
  Path,
} from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface PhoneInputFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  error?: FieldError;
  required?: boolean;
  placeholder?: string;
}

const PhoneInputField = <T extends FieldValues>({
  label,
  name,
  control,
  error,
  required,
  placeholder = "Enter phone number",
}: PhoneInputFieldProps<T>) => {

  const defaultCountry = typeof window !== 'undefined'
    ? (window.navigator.language.split('-')[1] as any || 'US')
    : 'US';

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <div className="phone-input-container">
        <Controller
          name={name}
          control={control}
          rules={{
            required: required ? "Phone number is required" : false,
            validate: (value) => {
              if (required && !value) return "Phone number is required";
              if (value && !isValidPhoneNumber(value)) {
                return "Invalid phone number";
              }
              return true;
            },
          }}
          render={({ field: { onChange, value } }) => (
            <PhoneInput
              international
              defaultCountry={defaultCountry}
              value={value as string}
              onChange={onChange}
              placeholder={placeholder}
              className={`flex w-full bg-gray-50 border ${error ? "border-red-500" : "border-gray-200"
                } rounded-xl px-4 py-1.5 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all`}
            />
          )}
        />
      </div>

      {error && (
        <span className="text-red-500 text-sm mt-1 block">{error.message}</span>
      )}

      <style jsx global>{`
        .phone-input-container .PhoneInputInput {
          border: none !important;
          background: transparent !important;
          outline: none !important;
          padding: 0.5rem 0 !important;
          font-size: 1rem;
          width: 100%;
        }
        .phone-input-container .PhoneInputCountry {
          margin-right: 0.75rem;
        }
        .phone-input-container .PhoneInputCountrySelectArrow {
          margin-left: 0.35rem;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default PhoneInputField;
