"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserRole, useAuth } from "@/lib/store/auth-store";
import { Shield, Store, UserCheck, ChevronDown, Check } from "lucide-react";

const ROLE_ACCOUNTS: Record<string, string> = {
  CUSTOMER: "grace.wanjiku@gmail.com",
  SELLER: "kevin@nairobihub.co.ke",
  BUSINESS_OWNER: "amina@savannafashion.ke",
  ADMIN: "admin@vendlex.vercel.app",
};

export function RoleSwitcher() {
  const { user, role, login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hide role switcher in production
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const roles: { role: UserRole; label: string; shortLabel: string; icon: any; desc: string }[] = [
    {
      role: "CUSTOMER",
      label: "Customer / Shopper",
      shortLabel: "Shopper",
      icon: UserCheck,
      desc: "Grace Wanjiku • Browse & Shop",
    },
    {
      role: "SELLER",
      label: "Seller (Tech Hub)",
      shortLabel: "Seller",
      icon: Store,
      desc: "Kevin Mwangi • Seller Dashboard",
    },
    {
      role: "BUSINESS_OWNER",
      label: "Business (Savanna)",
      shortLabel: "Business",
      icon: Store,
      desc: "Amina Hassan • Fashion Store",
    },
    {
      role: "ADMIN",
      label: "Platform Admin",
      shortLabel: "Admin",
      icon: Shield,
      desc: "Antony Otieno • Admin Portal",
    },
  ];

  const currentConfig = roles.find((r) => r.role === role) || roles[0];
  const CurrentIcon = currentConfig.icon;

  const handleRoleSelect = async (item: typeof roles[0]) => {
    const email = ROLE_ACCOUNTS[item.role];
    if (email) {
      await login(email, "password123");
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border border-brand-emerald/30 bg-brand-emerald-soft/50 dark:bg-brand-dark-card hover:bg-brand-emerald-soft text-brand-emerald dark:text-brand-emerald-light transition-all text-xs font-semibold"
        title="Switch Demo Role & Perspective"
      >
        <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse shrink-0" />
        <CurrentIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden xl:inline text-[11px] font-bold">{currentConfig.shortLabel}</span>
        <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl shadow-2xl z-50 p-2 animate-scaleUp">
          <div className="px-2.5 py-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Switch Perspective (Demo Mode)
          </div>

          <div className="space-y-1">
            {roles.map((item) => {
              const Icon = item.icon;
              const isSelected = item.role === role;
              return (
                <button
                  key={item.role}
                  onClick={() => handleRoleSelect(item)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                    isSelected
                      ? "bg-brand-emerald text-white"
                      : "hover:bg-muted dark:hover:bg-brand-dark-border text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-brand-emerald"}`} />
                    <div className="truncate">
                      <div className="text-xs font-bold truncate">{item.label}</div>
                      <div className={`text-[10px] truncate ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
