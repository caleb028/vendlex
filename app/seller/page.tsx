"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-store";
import { Loader2 } from "lucide-react";

export default function SellerRootPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && (user?.role === "SELLER" || user?.role === "BUSINESS_OWNER" || user?.role === "ADMIN")) {
      router.replace("/seller/dashboard");
    } else {
      router.replace("/seller/onboarding");
    }
  }, [user, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-off-white dark:bg-brand-dark-bg">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-emerald animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Opening VendLex Seller Hub...</p>
      </div>
    </div>
  );
}
