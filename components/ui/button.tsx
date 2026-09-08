import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "premium" | "gold" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-xl active:scale-[0.98]";

    const variants = {
      primary:
        "bg-brand-emerald text-white hover:bg-brand-emerald-dark focus:ring-brand-emerald shadow-sm hover:shadow-md hover:shadow-brand-emerald/20",
      secondary:
        "bg-transparent border border-brand-emerald text-brand-emerald hover:bg-brand-emerald/10 focus:ring-brand-emerald",
      premium:
        "bg-brand-navy text-white hover:bg-brand-navy-light border border-brand-gold/40 focus:ring-brand-navy shadow-sm",
      gold:
        "bg-brand-gold text-brand-navy font-bold hover:bg-brand-gold-dark focus:ring-brand-gold shadow-sm",
      outline:
        "border border-border text-foreground hover:bg-muted focus:ring-brand-emerald dark:border-brand-dark-border dark:hover:bg-brand-dark-card",
      ghost:
        "text-foreground hover:bg-muted focus:ring-brand-emerald dark:hover:bg-brand-dark-card",
      danger:
        "bg-brand-red text-white hover:bg-red-700 focus:ring-brand-red shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-6 text-base font-semibold",
      icon: "h-10 w-10 p-2",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
