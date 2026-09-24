"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/utils";

const Input = forwardRef(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      type = "text",
      showPasswordToggle = true,
      rightElement,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const ariaDescribedBy = errorId || helperId || undefined;

    const isPassword = type === "password";
    const canToggle = isPassword && showPasswordToggle;
    const effectiveType = canToggle ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={effectiveType}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={ariaDescribedBy}
            className={cn(
              "w-full rounded-xl border-[1.5px] border-border bg-surface-2 px-3.5 py-2.5 text-foreground placeholder:text-subtle focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/15 hover:border-border-strong hover:bg-surface transition-all text-sm min-h-[48px]",
              (canToggle || rightElement) && "pr-11",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15 bg-rose-50/30",
              className
            )}
            {...props}
          />
          {canToggle && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-1.5 text-muted hover:text-foreground focus:outline-none rounded-lg transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
          {rightElement && !canToggle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p id={errorId} className="text-xs text-rose-600 font-medium">{error}</p>}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
