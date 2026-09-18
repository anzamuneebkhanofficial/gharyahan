"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "../../lib/utils";

const Button = forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      children,
      type = "button",
      href,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer";

    const variants = {
      primary:
        "bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary shadow-card",
      secondary:
        "bg-accent text-foreground hover:bg-accent-hover focus-visible:ring-accent shadow-card font-bold",
      whatsapp:
        "bg-[#25D366] text-white hover:bg-[#20BA57] focus-visible:ring-[#25D366] shadow-card font-semibold",
      outline:
        "border border-primary/20 bg-surface text-foreground hover:bg-surface-2 hover:border-primary/40 focus-visible:ring-subtle font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
      ghost:
        "text-secondary hover:bg-surface-2 hover:text-foreground focus-visible:ring-[#D1D5DB] font-semibold",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600 shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs gap-1.5",
      md: "h-11 px-4 text-sm gap-2",
      lg: "h-13 px-6 text-base gap-2.5 min-h-[48px]", // Mobile tap priority
      icon: "h-10 w-10 p-0",
    };

    if (href) {
      return (
        <Link
          ref={ref}
          href={href}
          className={cn(baseStyles, variants[variant], sizes[size], className)}
          {...props}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
