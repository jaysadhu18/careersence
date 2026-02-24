import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  asChild?: false;
}

const variantClasses = {
  primary:
    "bg-[var(--color-primary-600)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--color-primary-700)] focus-visible:ring-[var(--color-primary-500)] disabled:bg-[var(--color-primary-300)]",
  secondary:
    "bg-[var(--color-secondary-600)] text-white hover:bg-[var(--color-secondary-700)] focus-visible:ring-[var(--color-secondary-500)] disabled:bg-[var(--color-secondary-300)]",
  outline:
    "border-2 border-[var(--color-primary-600)] bg-transparent text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] focus-visible:ring-[var(--color-primary-500)] disabled:border-[var(--color-border)] disabled:text-[var(--color-text-muted)]",
  ghost:
    "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-background)] focus-visible:ring-[var(--color-border)]",
};

const sizeClasses = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium",
  md: "h-10 gap-2 rounded-lg px-4 text-sm font-medium",
  lg: "h-12 gap-2 rounded-xl px-6 text-base font-medium",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
