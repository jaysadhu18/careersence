import { InputHTMLAttributes, forwardRef, useId, ReactNode } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  error?: string;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, id, className = "", ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || `checkbox-${generatedId.replace(/:/g, "")}`;

    return (
      <div className="w-full">
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            aria-invalid={!!error}
            className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary-600)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
            {...props}
          />
          <div className="flex-1">
            <label
              htmlFor={inputId}
              className="cursor-pointer text-sm font-medium text-[var(--color-text)]"
            >
              {label}
            </label>
            {helperText && !error && (
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{helperText}</p>
            )}
            {error && (
              <p className="mt-0.5 text-sm text-[var(--color-error)]" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
