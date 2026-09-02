"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";

export default function MobileParticles() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const orbs = useMemo(() => {
    const lightColors = [
      "radial-gradient(circle, rgba(27,64,121,0.35) 0%, transparent 70%)",
      "radial-gradient(circle, rgba(77,124,138,0.30) 0%, transparent 70%)",
      "radial-gradient(circle, rgba(184,201,232,0.35) 0%, transparent 70%)",
      "radial-gradient(circle, rgba(232,196,196,0.30) 0%, transparent 70%)",
      "radial-gradient(circle, rgba(255,215,0,0.25) 0%, transparent 70%)",
      "radial-gradient(circle, rgba(234,240,216,0.30) 0%, transparent 70%)",
    ];
    const darkColors = [
      "radial-gradient(circle, rgba(58,79,122,0.40) 0%, transparent 70%)",
      "radial-gradient(circle, rgba(90,58,58,0.35) 0%, transparent 70%)",
      "radial-gradient(circle, rgba(148,163,184,0.30) 0%, transparent 70%)",
      "radial-gradient(circle, rgba(100,200,255,0.35) 0%, transparent 70%)",
      "radial-gradient(circle, rgba(184,201,232,0.35) 0%, transparent 70%)",
      "radial-gradient(circle, rgba(255,220,100,0.30) 0%, transparent 70%)",
    ];
    const colors = isDark ? darkColors : lightColors;

    return Array.from({ length: 12 }, (_, i) => ({
      left: `${((i * 37.1) % 100)}%`,
      top: `${((i * 53.7 + 15) % 100)}%`,
      size: `${70 + (i % 6) * 35}px`,
      delay: `${-(i * 2.3)}s`,
      duration: `${9 + (i % 5) * 3}s`,
      color: colors[i % colors.length],
    }));
  }, [isDark]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full mobile-particle-orb"
          style={{
            left: orb.left,
            top: orb.top,
            width: orb.size,
            height: orb.size,
            background: orb.color,
            filter: "blur(16px)",
            animationDuration: orb.duration,
            animationDelay: orb.delay,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}
