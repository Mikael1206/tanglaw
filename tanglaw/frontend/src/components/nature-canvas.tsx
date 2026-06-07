"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  swaySpeed: number;
  swayAmount: number;
  swayOffset: number;
  // Theme color values (RGB)
  r: number;
  g: number;
  b: number;
  targetR: number;
  targetG: number;
  targetB: number;
}

export default function NatureCanvas() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Determine current theme
  const checkTheme = () => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("tanglaw-theme") || "light";
    setTheme(stored === "dark" ? "dark" : "light");
  };

  useEffect(() => {
    checkTheme();

    // Listen to storage event (works across tabs)
    window.addEventListener("storage", checkTheme);
    // Custom event dispatch for same-page immediate changes
    window.addEventListener("tanglaw-theme-change", checkTheme);

    // MutationObserver to watch style modifications on <html> element (immediate detection)
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

    return () => {
      window.removeEventListener("storage", checkTheme);
      window.removeEventListener("tanglaw-theme-change", checkTheme);
      observer.disconnect();
    };
  }, []);

  // Canvas particle logic
  useEffect(() => {
    if (pathname?.startsWith("/dashboard")) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle colors depending on theme
    const getColors = (currentTheme: "light" | "dark") => {
      if (currentTheme === "light") {
        return [
          { r: 27, g: 64, b: 121 },   // primary blue (subtle)
          { r: 127, g: 156, b: 150 }, // borders teal
          { r: 255, g: 215, b: 0 },   // gold
          { r: 234, g: 240, b: 216 }, // base pastel green
        ];
      } else {
        return [
          { r: 58, g: 79, b: 122 },   // dark periwinkle
          { r: 90, g: 58, b: 58 },    // dark rose
          { r: 148, g: 163, b: 184 }, // slate muted
          { r: 27, g: 64, b: 121 },   // primary blue
          { r: 100, g: 200, b: 255 }, // soft cyan
        ];
      }
    };

    const particles: Particle[] = [];
    const count = 55; // drifting orbs — increased for richer glow density

    // Initialize particles
    for (let i = 0; i < count; i++) {
      const palette = getColors(theme);
      const color = palette[Math.floor(Math.random() * palette.length)];
      const size = 18 + Math.random() * 34; // glowing orbs — larger for more presence
      const baseAlpha = 0.18 + Math.random() * 0.22;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.15 + Math.random() * 0.35), // slowly float upwards
        size,
        baseAlpha,
        alpha: baseAlpha,
        swaySpeed: 0.005 + Math.random() * 0.01,
        swayAmount: 5 + Math.random() * 15,
        swayOffset: Math.random() * 100,
        r: color.r,
        g: color.g,
        b: color.b,
        targetR: color.r,
        targetG: color.g,
        targetB: color.b,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background ambient gradient depending on theme
      const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height));
      if (theme === "light") {
        grad.addColorStop(0, "rgba(247, 249, 239, 0.95)"); // F7F9EF (base light)
        grad.addColorStop(1, "rgba(203, 223, 144, 0.9)");  // CBDF90 (canvas green)
      } else {
        grad.addColorStop(0, "rgba(21, 31, 56, 0.95)");   // 151F38 (base dark light)
        grad.addColorStop(1, "rgba(11, 19, 43, 0.95)");   // 0B132B (canvas dark)
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const palette = getColors(theme);

      // Render & Update particles
      particles.forEach((p) => {
        // Smoothly interpolate color coordinates to follow theme updates
        const colorSpeed = 0.05; // speed of color profile shifting
        p.r += (p.targetR - p.r) * colorSpeed;
        p.g += (p.targetG - p.g) * colorSpeed;
        p.b += (p.targetB - p.b) * colorSpeed;

        // Sway back and forth using sine wave
        p.swayOffset += p.swaySpeed;
        const currentX = p.x + Math.sin(p.swayOffset) * p.swayAmount;

        // Draw soft glowing orb
        const radialGrad = ctx.createRadialGradient(
          currentX,
          p.y,
          0,
          currentX,
          p.y,
          p.size
        );
        radialGrad.addColorStop(0, `rgba(${Math.round(p.r)}, ${Math.round(p.g)}, ${Math.round(p.b)}, ${p.alpha})`);
        radialGrad.addColorStop(0.3, `rgba(${Math.round(p.r)}, ${Math.round(p.g)}, ${Math.round(p.b)}, ${p.alpha * 0.6})`);
        radialGrad.addColorStop(0.6, `rgba(${Math.round(p.r)}, ${Math.round(p.g)}, ${Math.round(p.b)}, ${p.alpha * 0.2})`);
        radialGrad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(currentX, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Update positions
        p.y += p.vy;

        // If a particle moves off screen, wrap it around
        if (p.y < -p.size) {
          p.y = height + p.size;
          p.x = Math.random() * width;
          // Assign new random theme color
          const newColor = palette[Math.floor(Math.random() * palette.length)];
          p.r = p.targetR = newColor.r;
          p.g = p.targetG = newColor.g;
          p.b = p.targetB = newColor.b;
        }

        // Randomly modulate alpha for a prominent twinkling glow effect
        p.alpha = p.baseAlpha * (0.70 + Math.sin(p.swayOffset * 3) * 0.30);
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Trigger color update whenever theme state changes
    particles.forEach((p) => {
      const palette = getColors(theme);
      const color = palette[Math.floor(Math.random() * palette.length)];
      p.targetR = color.r;
      p.targetG = color.g;
      p.targetB = color.b;
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, pathname]);

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-20 w-full h-full block"
    />
  );
}
