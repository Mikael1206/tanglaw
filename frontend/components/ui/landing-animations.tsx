"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import ScrollReveal from "@/components/scroll-reveal";
import { EtheralShadow } from "./etheral-shadow";

const OwelMascot = dynamic(
  () => import("./owel-mascot").then((mod) => mod.OwelMascot),
  { ssr: false, loading: () => <div className="w-full aspect-square max-w-[520px] animate-pulse rounded-full bg-white/10" /> }
);

export function LandingBackground() {
  return (
    <EtheralShadow
      animation={{ scale: 60, speed: 80 }}
      noise={{ opacity: 0.8, scale: 1.0 }}
      sizing="cover"
      lightColor="rgba(200, 230, 175, 0.85)"
    />
  );
}

export function HeroButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  const baseClass =
    variant === "primary"
      ?      "inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-[0.24em] text-white shadow-2xl shadow-black/20 transition-all duration-300 hover:bg-primary-hover cursor-pointer shadow-[var(--theme-glow-primary)]"
      : "inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[color:var(--theme-typography-main)] shadow-2xl shadow-black/15 transition duration-300 hover:bg-white/10 cursor-pointer";

  return (
    <motion.button whileHover={{ scale: 1.03 }} onClick={onClick} className={baseClass}>
      {children}
    </motion.button>
  );
}

export function MascotWithGlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const animationPlayState = isInView ? 'running' : 'paused';

  return (
    <div ref={containerRef} className="relative flex items-center justify-center w-full">
      <style>{`
        @keyframes glow-pulse-outer {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.12); opacity: 0.9; }
        }
        @keyframes glow-pulse-inner {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        @keyframes glow-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .glow-outer {
          animation: glow-pulse-outer 2s ease-in-out infinite;
          animation-play-state: ${animationPlayState};
        }
        .glow-inner {
          animation: glow-pulse-inner 2.5s ease-in-out 0.3s infinite;
          animation-play-state: ${animationPlayState};
        }
        .glow-float {
          animation: glow-float 3s ease-in-out infinite;
          animation-play-state: ${animationPlayState};
        }
      `}</style>
      {/* Animated glow halo behind mascot */}
      <div
        className="glow-outer absolute w-[85%] aspect-square rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(184,201,232,0.35) 0%, rgba(184,201,232,0.12) 40%, transparent 70%)",
          filter: "blur(60px)",
          willChange: "transform, opacity",
        }}
      />
      {/* Inner bright core glow */}
      <div
        className="glow-inner absolute w-[50%] aspect-square rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)",
          filter: "blur(30px)",
          willChange: "transform, opacity",
        }}
      />
      <div className="glow-float relative z-10 w-full">
        <OwelMascot />
      </div>
    </div>
  );
}

export const FeatureCard = React.memo(function FeatureCard({
  title,
  description,
  delay,
  direction,
}: {
  title: string;
  description: string;
  delay: number;
  direction: "up";
}) {
  return (
    <ScrollReveal delay={delay} direction={direction}>
      <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)] p-6 shadow-xl shadow-black/20 backdrop-blur-sm h-full hover:border-white/20 transition-all duration-500">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 h-20 w-20 rounded-full bg-[color:var(--theme-accent-periwinkle)]/5 blur-2xl" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-bold">
            {title}
          </p>
          <p className="mt-4 text-sm leading-7 text-[color:var(--theme-text-body)]">{description}</p>
        </div>
      </article>
    </ScrollReveal>
  );
});
