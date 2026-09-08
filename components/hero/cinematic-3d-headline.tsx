"use client";

import React, { useEffect, useState, useRef } from "react";

interface Props {
  className?: string;
}

const HEADLINE_TEXT = "Kenya's Marketplace for Everything That Moves Business Forward";

export function Cinematic3DHeadline({ className = "" }: Props) {
  const [mounted, setMounted] = useState(false);
  const [isEntranceComplete, setIsEntranceComplete] = useState(false);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setMounted(true);

    // Total entrance sequence: ~55 chars * 38ms + word breaks + 850ms animation duration ~= 2.7s
    const timer = setTimeout(() => {
      setIsEntranceComplete(true);
    }, 2700);

    return () => clearTimeout(timer);
  }, []);

  // Desktop subtle pointer parallax (rotateX ±1.8deg, rotateY ±2.5deg)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!hasFinePointer) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized distance from headline center [-1, 1]
      const dx = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth / 2)));
      const dy = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight / 2)));

      // Subtle tilt: smooth, restrained, strictly within ±2deg X, ±3deg Y
      const targetRotateX = -dy * 1.8;
      const targetRotateY = dx * 2.5;

      rafId = requestAnimationFrame(() => {
        setTilt({ x: targetRotateX, y: targetRotateY });
      });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Split into words to preserve line-break rhythm and prevent mid-word breaks
  const words = HEADLINE_TEXT.split(" ");
  let globalCharIndex = 0;

  return (
    <h1
      ref={containerRef}
      aria-label={HEADLINE_TEXT}
      className={`relative text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none select-none ${className}`}
      style={{ perspective: "1200px" }}
    >
      {/* 3D Interactive Container Wrapper */}
      <span
        className={`relative inline-block w-full ${isEntranceComplete ? "headline-idle-float" : ""}`}
        style={{
          transformStyle: "preserve-3d",
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
          transition: "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {words.map((word, wordIdx) => {
          const wordChars = word.split("");

          return (
            <span
              key={wordIdx}
              className="inline-block whitespace-nowrap mr-[0.28em] last:mr-0"
              style={{ transformStyle: "preserve-3d" }}
            >
              {wordChars.map((char, charIdx) => {
                // Cascading timing: 38ms per letter with subtle word-boundary rhythm
                const currentDelay = globalCharIndex * 38 + wordIdx * 18;
                globalCharIndex++;

                return (
                  <span
                    key={charIdx}
                    aria-hidden="true"
                    className={`letter-3d-animated ${mounted ? "" : "opacity-0"}`}
                    style={{
                      animationDelay: `${currentDelay}ms`,
                      animationPlayState: mounted ? "running" : "paused",
                      willChange: isEntranceComplete ? "auto" : "transform, opacity",
                    }}
                  >
                    <span className="relative z-10 inline-block">{char}</span>
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </h1>
  );
}
