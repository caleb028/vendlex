"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "lg",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={cn(
          "relative w-full bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl shadow-2xl z-10 overflow-hidden transform transition-all animate-pop-up my-auto max-h-[90vh] flex flex-col",
          maxWidths[maxWidth]
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border dark:border-brand-dark-border shrink-0 bg-muted/20">
            <h3 className="text-sm sm:text-base font-black text-foreground truncate pr-2">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted dark:hover:bg-brand-dark-border transition-colors shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
