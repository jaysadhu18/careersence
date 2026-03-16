import { SelectHTMLAttributes, forwardRef, useId, ReactNode } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, id, className = "", ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || `select-${generatedId.replace(/:/g, "")}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={`block appearance-none w-full rounded-lg border bg-transparent py-2.5 pl-3 pr-10 text-[var(--color-text)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:cursor-not-allowed disabled:opacity-60 ${error
              ? "border-[var(--color-error)]"
              : "border-[var(--color-border)]"
              } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-muted)]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[var(--color-error)]" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
