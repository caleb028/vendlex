"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "fade-up" | "fade-in" | "zoom-out" | "pop-up" | "slide-left" | "slide-right";
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  threshold = 0.12,
  once = true,
  className,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If browser doesn't support IntersectionObserver or user prefers reduced motion
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsRevealed(false);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  const variantClass =
    variant === "zoom-out"
      ? "scroll-hidden-zoom"
      : variant === "slide-left"
      ? "scroll-hidden-left"
      : variant === "slide-right"
      ? "scroll-hidden-right"
      : "scroll-hidden";

  return (
    <div
      ref={ref}
      className={cn(
        variantClass,
        isRevealed && "scroll-revealed",
        variant === "pop-up" && isRevealed && "animate-pop-up",
        className
      )}
      style={{
        transitionDelay: delay > 0 ? `${delay}ms` : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Hook to apply scroll animation to raw DOM elements
 */
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<any>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isRevealed };
}
