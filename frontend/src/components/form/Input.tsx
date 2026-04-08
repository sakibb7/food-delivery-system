export interface InputProps {
  name: string;
  value: string | number;
  type?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  validationError?: string;
  onChange: (value: string) => void;
  isInvalid?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type = "text",
  name,
  value,
  validationError,
  onChange,
  className,
  placeholder,
  required,
  isInvalid,
  ...rest
}) => {
  const handleTextChange = (value: string) => {
    if (type === "number") {
      const numericValue = value.replace(/[^0-9]/g, "");
      onChange(numericValue);
    } else {
      onChange(value);
    }
  };

  return type === "textarea" ? (
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={`${className}`}
      aria-invalid={!!validationError}
      aria-describedby={validationError ? `${name}-error` : undefined}
      {...rest}
    ></textarea>
  ) : (
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={(e) => handleTextChange(e.target.value)}
      className={`${validationError && ""} ${isInvalid && ""} ${className}`}
      placeholder={placeholder}
      required={required}
      aria-invalid={!!validationError}
      aria-describedby={validationError ? `${name}-error` : undefined}
      {...rest}
    />
  );
};
