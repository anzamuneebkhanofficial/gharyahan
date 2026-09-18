"use client";

import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      options = [],
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;
    const ariaDescribedBy = errorId || helperId || undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={ariaDescribedBy}
            className={cn(
              "w-full appearance-none rounded-xl border border-border bg-surface px-3.5 py-2.5 pr-10 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm min-h-[48px]",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
            {...props}
          >
            {options.length > 0
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && <p id={errorId} className="text-xs text-rose-600 font-medium">{error}</p>}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
