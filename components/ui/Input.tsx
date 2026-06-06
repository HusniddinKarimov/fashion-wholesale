import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink font-sans">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-10 w-full rounded-md border bg-white px-3 text-sm font-sans text-ink transition-colors",
            "placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cta focus:border-transparent",
            error ? "border-red-400" : "border-border",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-sans">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
