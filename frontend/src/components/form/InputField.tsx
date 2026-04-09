import {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { LucideIcon } from "lucide-react";

interface InputFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  error?: FieldError;
  icon?: LucideIcon;
  required?: boolean;
}

const InputField = <T extends FieldValues>({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
  icon: Icon,
  required,
}: InputFieldProps<T>) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon size={18} className="text-gray-400" />
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          className={`pl-11 w-full bg-gray-50 border ${
            error ? "border-red-500" : "border-gray-200"
          } rounded-xl py-4`}
          {...register(name, {
            required: required ? "This field is required" : false,
          })}
        />
      </div>

      {error && <span className="text-red-500 text-sm">{error.message}</span>}
    </div>
  );
};

export default InputField;
