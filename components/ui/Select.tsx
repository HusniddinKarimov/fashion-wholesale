import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink font-sans">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            "h-10 w-full rounded-md border bg-white px-3 text-sm font-sans text-ink transition-colors appearance-none",
            "focus:outline-none focus:ring-2 focus:ring-cta focus:border-transparent cursor-pointer",
            error ? "border-red-400" : "border-border",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500 font-sans">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
