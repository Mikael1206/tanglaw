"use client";

/**
 * Decorative background canvas used on public pages.
 * Supports light/dark theme states and hides on dashboard pages.
 */
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const leafCount = 8;
const leafShapes = Array.from({ length: leafCount }, (_, index) => ({
  id: index,
  left: 8 + index * 12,
  size: 8 + (index % 3) * 4,
  delay: index * 0.4,
  speed: 12 + (index % 4) * 3,
}));

export default function NatureCanvas() {
  const pathname = usePathname();
  const [theme, setTheme] = useState("midnight");

  useEffect(() => {
    const stored = window.localStorage.getItem("tanglaw-theme");
    if (stored === "classic") {
      setTheme("sunny");
      return;
    }
    if (stored === "deep") {
      setTheme("midnight");
      return;
    }
    setTheme("midnight");
  }, []);

  const leaves = useMemo(
    () =>
      leafShapes.map((leaf) => ({
        ...leaf,
        xOffset: leaf.left + Math.sin(leaf.delay) * 5,
      })),
    []
  );

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  const isSunny = theme === "sunny";
  const backgroundGradient = isSunny
    ? "radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_transparent_35%),radial-gradient(circle_at_85%_20%,_rgba(255,255,255,0.2),_transparent_20%)"
    : "radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_18%),radial-gradient(circle_at_10%_20%,_rgba(64,136,223,0.15),_transparent_24%)";

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: isSunny ? "#CBDF90" : "#081124",
          backgroundImage: backgroundGradient,
        }}
      />

      {isSunny ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_transparent_45%)]" />
      ) : (
        <div className="pointer-events-none absolute inset-x-0 top-10 h-72 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]" />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72">
        <div className="absolute bottom-0 left-0 h-48 w-32 rounded-t-full bg-[#0b2349]/95 blur-[1px]" />
        <div className="absolute bottom-0 left-24 h-56 w-40 rounded-t-full bg-[#0f294b]/90 blur-[1px]" />
        <div className="absolute bottom-0 right-10 h-64 w-52 rounded-t-full bg-[#10214b]/90 blur-[1px]" />
      </div>

      {!isSunny && (
        <motion.div
          className="pointer-events-none absolute right-12 top-14 h-24 w-24 rounded-full bg-white/15 shadow-[0_0_80px_rgba(255,255,255,0.14)]"
          animate={{ y: [0, 4, 0], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {isSunny && (
        <motion.div
          className="pointer-events-none absolute left-10 top-10 h-28 w-28 rounded-full bg-white/80 blur-2xl"
          animate={{ scale: [1, 1.05, 1], opacity: [0.35, 0.45, 0.35] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {leaves.map((leaf) => (
        <motion.span
          key={leaf.id}
          className={"absolute rounded-full " + (isSunny ? "bg-white/20" : "bg-white/10")}
          style={{
            left: `${leaf.left}%`,
            width: leaf.size,
            height: leaf.size * 0.6,
            bottom: isSunny ? 48 : 38,
            opacity: 0.3,
          }}
          animate={{
            y: [0, isSunny ? 18 : 12, 0],
            x: [0, isSunny ? 12 : 6, 0],
          }}
          transition={{
            duration: leaf.speed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: leaf.delay,
          }}
        />
      ))}
    </div>
  );
}
