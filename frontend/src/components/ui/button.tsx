import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer";

const variants: Record<Variant, string> = {
  primary: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30",
  secondary: "bg-gray-800 hover:bg-gray-900 text-white shadow-md",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  ghost: "text-gray-700 hover:bg-gray-100",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-base",
  lg: "px-6 py-4 text-lg",
};

const Button = ({
  children,
  variant = "primary",
  size = "lg",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const classes = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `.trim();

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {/* Left Icon / Loader */}
      {loading ? <Loader2 className="animate-spin" size={18} /> : leftIcon}

      {/* Text */}
      {children}

      {/* Right Icon */}
      {!loading && rightIcon && (
        <span className="transition-transform group-hover:translate-x-1">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
