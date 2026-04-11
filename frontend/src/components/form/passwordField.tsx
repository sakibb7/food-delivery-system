import {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  placeholder?: string;
  required?: boolean;

  // 👇 new props
  compareWith?: Path<T>;
  watch?: UseFormWatch<T>;
  isRegisterPage?: boolean;
}

const getPasswordStrength = (password: string) => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
};

const getStrengthLabel = (score: number) => {
  if (score <= 2) return "Weak";
  if (score === 3 || score === 4) return "Medium";
  return "Strong";
};

const getStrengthColor = (score: number) => {
  if (score <= 2) return "bg-red-500";
  if (score === 3 || score === 4) return "bg-yellow-500";
  return "bg-green-500";
};

const PasswordField = <T extends FieldValues>({
  label,
  name,
  register,
  error,
  placeholder = "Enter password",
  required,
  compareWith,
  watch,
  isRegisterPage = false,
}: PasswordFieldProps<T>) => {
  const [show, setShow] = useState(false);

  const [value, setValue] = useState("");

  const score = getPasswordStrength(value);

  const compareValue = compareWith && watch ? watch(compareWith) : undefined;

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">
        {/* Left icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Lock size={18} className="text-gray-400" />
        </div>

        {/* Input */}
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className={`pl-11 pr-11 w-full bg-gray-50 border ${
            error ? "border-red-500" : "border-gray-200"
          } rounded-xl py-4 focus:outline-none focus:ring-2 focus:ring-red-500`}
          {...register(name, {
            required: required ? "This field is required" : false,
            validate: (value) => {
              if (compareWith && compareValue !== undefined) {
                return value === compareValue || "Passwords do not match";
              }
              return true;
            },
            onChange: (e) => setValue(e.target.value),
          })}
        />

        {/* Toggle visibility */}
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
        >
          {show ? (
            <EyeOff size={18} className="text-gray-500" />
          ) : (
            <Eye size={18} className="text-gray-500" />
          )}
        </button>
      </div>
      {/* Strength bar */}
      {value && name === "password" && isRegisterPage && (
        <div className="mt-2">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStrengthColor(score)} transition-all`}
              style={{ width: `${(score / 5) * 100}%` }}
            />
          </div>
          <p className="text-sm mt-1 text-gray-600">
            Strength: {getStrengthLabel(score)}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <span className="text-red-500 text-sm mt-1 block">{error.message}</span>
      )}
    </div>
  );
};

export default PasswordField;
