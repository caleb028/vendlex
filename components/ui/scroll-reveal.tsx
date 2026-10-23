"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: "fade-up" | "fade-in" | "zoom-out" | "pop-up" | "slide-left" | "slide-right";
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

export function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.85,
  threshold = 0.08,
  once = false,
  className,
  style,
  id,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div id={id} className={className} style={style}>
        {children}
      </div>
    );
  }

  const delaySeconds = delay ? delay / 1000 : 0;

  let initialVariants = { opacity: 0, y: 16, scale: 0.992, x: 0 };
  if (variant === "fade-in") {
    initialVariants = { opacity: 0, y: 0, scale: 1, x: 0 };
  } else if (variant === "zoom-out") {
    initialVariants = { opacity: 0, y: 0, scale: 0.975, x: 0 };
  } else if (variant === "pop-up") {
    initialVariants = { opacity: 0, y: 14, scale: 0.985, x: 0 };
  } else if (variant === "slide-left") {
    initialVariants = { opacity: 0, y: 0, scale: 1, x: -20 };
  } else if (variant === "slide-right") {
    initialVariants = { opacity: 0, y: 0, scale: 1, x: 20 };
  }

  return (
    <motion.div
      id={id}
      initial={initialVariants}
      whileInView={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      viewport={{ once, amount: threshold, margin: "-20px 0px -20px 0px" }}
      transition={{
        duration,
        delay: delaySeconds,
        ease: CUBIC_EASE,
      }}
      className={cn("w-full transform-gpu", className)}
      style={{ willChange: "opacity, transform", ...style }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered container for cards and lists (exact match to top-grade-rice-millers.vercel.app)
 */
export function ScrollStaggerContainer({
  children,
  className,
  staggerDelay = 0.055,
  threshold = 0.08,
  once = false,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  threshold?: number;
  once?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold, margin: "-20px 0px -20px 0px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={cn("transform-gpu", className)}
    >
      {children}
    </motion.div>
  );
}

export function ScrollStaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.992 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.8,
            ease: CUBIC_EASE,
          },
        },
      }}
      className={cn("transform-gpu", className)}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hook to apply scroll animation to raw DOM elements (for backward compatibility)
 */
export function useScrollReveal(threshold = 0.15) {
  const [isRevealed, setIsRevealed] = React.useState(true);
  const ref = React.useRef<any>(null);
  return { ref, isRevealed };
}
