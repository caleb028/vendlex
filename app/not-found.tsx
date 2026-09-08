import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] bg-brand-off-white dark:bg-brand-dark-bg flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-emerald-soft dark:bg-brand-dark-border text-brand-emerald flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black text-brand-red bg-red-50 dark:bg-red-950 px-3 py-1 rounded-full uppercase tracking-wider">
            404 • Page Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground pt-1">
            Looks like this page took a wrong turn.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Let&apos;s get you back to Kenya&apos;s digital marketplace & growth platform. 🇰🇪
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/marketplace"
            className="w-full sm:w-auto bg-muted hover:bg-muted/80 text-foreground font-bold py-3 px-5 rounded-xl text-xs transition-colors"
          >
            <span>Browse Marketplace &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
