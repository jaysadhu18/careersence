import { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--color-background)] text-[var(--color-text)] border border-[var(--color-border)]",
  primary: "bg-[var(--color-primary-100)] text-[var(--color-primary-800)]",
  secondary: "bg-[var(--color-secondary-100)] text-[var(--color-secondary-800)]",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  error: "bg-red-100 text-red-800",
  outline:
    "border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)]",
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium ${variantClasses[variant]} ${
        size === "sm" ? "rounded px-1.5 py-0.5 text-xs" : "rounded-md px-2.5 py-0.5 text-sm"
      } ${className}`}
    >
      {children}
    </span>
  );
}
