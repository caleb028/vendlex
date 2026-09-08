import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "emerald" | "gold" | "red" | "outline" | "verified";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-muted text-muted-foreground border-transparent",
    emerald:
      "bg-brand-emerald-soft text-brand-emerald border-brand-emerald/20 dark:bg-brand-dark-card dark:text-brand-emerald-light dark:border-brand-emerald/30",
    gold:
      "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40 font-medium",
    red:
      "bg-red-50 text-brand-red border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/40",
    outline:
      "text-foreground border-border dark:border-brand-dark-border",
    verified:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50 font-semibold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 bg-emerald-50 text-brand-emerald text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:bg-emerald-950/40 dark:text-brand-emerald-light dark:border-brand-emerald/30",
        className
      )}
      title="Verified Kenyan Business"
    >
      <svg className="w-3.5 h-3.5 fill-brand-emerald dark:fill-brand-emerald-light" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span>Verified</span>
    </span>
  );
}
