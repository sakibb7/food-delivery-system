import { Input } from "./Input";
import { User } from "lucide-react";

interface InputGroupProps {
  label: string;
  name: string;
  value: string | number;
  onChange: React.Dispatch<React.SetStateAction<string | number>>;
  placeholder?: string;
  required?: boolean;
  errors?: Record<string, string>;
  type?: string;
  isInvalid?: boolean;
}
export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  errors,
  type = "text",
  isInvalid,
}) => {
  const validationErrorMessage = errors?.[name] ?? "";

  return (
    <div className="">
      <label
        htmlFor={name}
        className={`block text-sm font-semibold text-gray-700 mb-2`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="w-full flex justify-start items-center gap-3 p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl font-medium">
        <User size={18} className="text-gray-400" />
        <Input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          validationError={validationErrorMessage}
          isInvalid={isInvalid}
        />
        <p className={`mt-1 text-sm text-red-500`}>{validationErrorMessage}</p>
      </div>
    </div>
  );
};
