"use client";

import { useEffect, useRef } from "react";
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
  // Parallax depth (0.5 = far back, 1.5 = near front)
  depth: number;
  // Sparkle effect
  isSparkle: boolean;
  // Theme color values (RGB)
  r: number;
  g: number;
  b: number;
  targetR: number;
  targetG: number;
  targetB: number;
  // Trail history for particle trails
  trail: { x: number; y: number }[];
  // Original position for spring-back
  originalX: number;
  originalY: number;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  r: number;
  g: number;
  b: number;
}

/** Simple LRU cache backed by Map insertion order. */
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private maxSize: number) {}

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value === undefined) return undefined;
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, value);
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value as K | undefined;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
  }
}

interface NatureCanvasProps {
  countDesktop?: number;
  countTablet?: number;
  countMobile?: number;
  className?: string;
}

/** Returns true if the viewport is narrow (mobile). Used to disable expensive effects. */
function isMobileWidth(width: number): boolean {
  return width < 768;
}

export default function NatureCanvas({
  countDesktop = 75,
  countTablet = 55,
  countMobile = 15,
  className,
}: NatureCanvasProps) {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<"light" | "dark">("light");
  const reducedMotionRef = useRef(false);
  const isVisibleRef = useRef(true);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine current theme — writes to ref only (animation loop reads from ref)
  const checkTheme = () => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("tanglaw-theme") || "light";
    themeRef.current = stored === "dark" ? "dark" : "light";
  };

  // Check reduced motion preference
  const checkReducedMotion = () => {
    if (typeof window === "undefined") return;
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  const GLOW_CSS_VAR = "--particles-glow-filter";

  // Idle timer: hide particles after 5s of no activity (mobile only to save battery)
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      idleTimerRef.current = setTimeout(() => {
        isVisibleRef.current = false;
        if (containerRef.current) containerRef.current.style.opacity = "0";
      }, 5000);
    }
  };

  const handleActivity = () => {
    isVisibleRef.current = true;
    if (containerRef.current) containerRef.current.style.opacity = "1";
    resetIdleTimer();
  };

  const scrollYRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const lastScrollTimeRef = useRef(0);

  useEffect(() => {
    checkTheme();
    checkReducedMotion();

    // Apply CSS glow variable
    const isDark = themeRef.current === "dark";
    document.documentElement.style.setProperty(
      GLOW_CSS_VAR,
      isDark
        ? "drop-shadow(0 0 12px rgba(255,235,200,0.80)) drop-shadow(0 0 40px rgba(255,235,200,0.45)) drop-shadow(0 0 80px rgba(255,215,0,0.20))"
        : "drop-shadow(0 0 14px rgba(29,78,216,0.75)) drop-shadow(0 0 40px rgba(124,58,237,0.35)) drop-shadow(0 0 80px rgba(29,78,216,0.15))"
    );

    // Listen to storage event (works across tabs)
    window.addEventListener("storage", checkTheme);
    // Custom event dispatch for same-page immediate changes
    window.addEventListener("tanglaw-theme-change", checkTheme);

    // MutationObserver to watch style modifications on <html> element (immediate detection)
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

    // Reduced motion observer
    const motionObserver = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionObserver.addEventListener("change", checkReducedMotion);

    // Idle timer + Scroll tracking: track user activity and scroll velocity
    const onScroll = () => {
      const now = performance.now();
      const dt = now - lastScrollTimeRef.current;
      const currentY = window.scrollY;
      if (dt > 0 && dt < 100) { // Only calculate velocity for continuous scroll
        const dy = currentY - scrollYRef.current;
        scrollVelocityRef.current = scrollVelocityRef.current * 0.5 + (dy / dt) * 0.5;
      }
      scrollYRef.current = currentY;
      lastScrollTimeRef.current = now;
      handleActivity();
    };

    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", handleActivity, { passive: true });
    resetIdleTimer();

    return () => {
      window.removeEventListener("storage", checkTheme);
      window.removeEventListener("tanglaw-theme-change", checkTheme);
      observer.disconnect();
      motionObserver.removeEventListener("change", checkReducedMotion);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", handleActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Canvas particle logic — depends only on pathname (not theme) to avoid full recreation on theme change
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
    // Frame rate cap: target ~30fps desktop, ~15fps mobile to reduce GPU load
    let isMobile = isMobileWidth(width);
    let FRAME_INTERVAL = isMobile ? 1000 / 15 : 1000 / 30;
    let lastFrameTime = 0;

    // Responsive particle count based on viewport width (configurable via props)
    const getParticleCount = () => {
      if (width >= 1024) return countDesktop;
      if (width >= 768) return countTablet;
      return countMobile;
    };

    // Particle colors depending on theme — reads from ref to avoid stale closures
    const getColors = (currentTheme: "light" | "dark") => {
      if (currentTheme === "light") {
        return [
          { r: 27, g: 64, b: 121 },   // primary blue
          { r: 77, g: 124, b: 138 },  // slate teal
          { r: 184, g: 201, b: 232 }, // periwinkle
          { r: 232, g: 196, b: 196 }, // rose
          { r: 255, g: 215, b: 0 },   // gold
          { r: 234, g: 240, b: 216 }, // pastel green
        ];
      } else {
        return [
          { r: 58, g: 79, b: 122 },   // dark periwinkle
          { r: 90, g: 58, b: 58 },    // dark rose
          { r: 148, g: 163, b: 184 }, // slate muted
          { r: 27, g: 64, b: 121 },   // primary blue
          { r: 100, g: 200, b: 255 }, // soft cyan
          { r: 184, g: 201, b: 232 }, // bright periwinkle
          { r: 255, g: 220, b: 100 }, // warm gold
        ];
      }
    };

    const particles: Particle[] = [];
    const burstParticles: BurstParticle[] = [];
    const count = getParticleCount();

    // Defer heavy initialization to avoid long main-thread task
    const startParticles = () => {
    // Initialize particles
    for (let i = 0; i < count; i++) {
      const palette = getColors(themeRef.current);
      const color = palette[Math.floor(Math.random() * palette.length)];
      const size = isMobile ? 8 + Math.random() * 14 : 18 + Math.random() * 34; // smaller orbs on mobile
      const baseAlpha = 0.18 + Math.random() * 0.22;
      const x = Math.random() * width;
      const y = Math.random() * height;

      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.15 + Math.random() * 0.35), // slowly float upwards
        size,
        baseAlpha,
        alpha: baseAlpha,
        swaySpeed: 0.005 + Math.random() * 0.01,
        swayAmount: 5 + Math.random() * 15,
        swayOffset: Math.random() * 100,
        depth: 0.6 + Math.random() * 0.8, // 0.6 - 1.4 parallax depth
        isSparkle: Math.random() < 0.25, // 25% sparkle particles
        r: color.r,
        g: color.g,
        b: color.b,
        targetR: color.r,
        targetG: color.g,
        targetB: color.b,
        trail: [],
        originalX: x,
        originalY: y,
      });
    }
    }; // end startParticles

    // Defer heavy particle initialization to avoid long main-thread task
    const idleId = typeof requestIdleCallback !== "undefined"
      ? requestIdleCallback(startParticles, { timeout: 2000 })
      : setTimeout(startParticles, 0) as unknown as number;

    // Throttled resize handler (max once per 200ms)
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimeout) return;
      resizeTimeout = setTimeout(() => {
        resizeTimeout = null;
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        isMobile = isMobileWidth(width);
        FRAME_INTERVAL = isMobile ? 1000 / 15 : 1000 / 30;
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    // ─── Offscreen Canvas Caches ──────────────────────────────────────────────
    // Cache the background gradient so it isn't recalculated 60 times a second.
    const bgCache = document.createElement("canvas");
    bgCache.width = width;
    bgCache.height = height;
    const bgCacheCtx = bgCache.getContext("2d")!;

    const renderBgCache = () => {
      bgCache.width = width;
      bgCache.height = height;
      const grad = bgCacheCtx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height));
      if (themeRef.current === "light") {
        grad.addColorStop(0, "rgba(247, 249, 239, 0.95)");
        grad.addColorStop(1, "rgba(203, 223, 144, 0.9)");
      } else {
        grad.addColorStop(0, "rgba(21, 31, 56, 0.95)");
        grad.addColorStop(1, "rgba(11, 19, 43, 0.95)");
      }
      bgCacheCtx.fillStyle = grad;
      bgCacheCtx.fillRect(0, 0, width, height);
    };
    renderBgCache();

    // Particle glow cache: keyed by r,g,b,alpha,size rounded to reduce cache misses
    // Capped at 1500 entries on desktop, 400 on mobile to prevent memory bloat.
    const particleGlowCache = new LRUCache<string, HTMLCanvasElement>(isMobile ? 400 : 1500);
    const getParticleGlowCanvas = (r: number, g: number, b: number, alpha: number, size: number): HTMLCanvasElement => {
      const key = `${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha.toFixed(2)},${Math.round(size)}`;
      const cached = particleGlowCache.get(key);
      if (cached) return cached;

      const off = document.createElement("canvas");
      off.width = size * 2;
      off.height = size * 2;
      const offCtx = off.getContext("2d")!;
      const radialGrad = offCtx.createRadialGradient(size, size, 0, size, size, size);
      radialGrad.addColorStop(0, `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`);
      radialGrad.addColorStop(0.3, `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha * 0.6})`);
      radialGrad.addColorStop(0.6, `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha * 0.2})`);
      radialGrad.addColorStop(1, "rgba(0,0,0,0)");
      offCtx.fillStyle = radialGrad;
      offCtx.beginPath();
      offCtx.arc(size, size, size, 0, Math.PI * 2);
      offCtx.fill();

      particleGlowCache.set(key, off);
      return off;
    };

    // Animation Loop — capped at ~30fps, reads theme from ref
    let isRunning = true;
    let lastBgColor = themeRef.current;

    // Mouse tracking for interactivity (position + velocity for wind effect)
    const mouse = { x: -1000, y: -1000, active: false, windX: 0, windY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouse.x;
      const dy = e.clientY - mouse.y;
      // Smooth wind velocity with low-pass filter (skip first event after init/leave)
      if (mouse.x !== -1000) {
        mouse.windX = mouse.windX * 0.6 + dx * 0.4;
        mouse.windY = mouse.windY * 0.6 + dy * 0.4;
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };
    const isInteractiveElement = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return tag === "button" || tag === "a" || tag === "input" || tag === "textarea" || tag === "select" || tag === "label" || target.closest("button, a, input, textarea, select, label") !== null;
    };

    const handleClick = (e: MouseEvent) => {
      if (reducedMotionRef.current) return;
      if (isMobile) return; // disable burst particles on mobile to save GPU
      if (isInteractiveElement(e.target)) return;
      const palette = getColors(themeRef.current);
      const burstCount = 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < burstCount; i++) {
        const angle = (Math.PI * 2 * i) / burstCount + Math.random() * 0.5;
        const speed = 2 + Math.random() * 3;
        const color = palette[Math.floor(Math.random() * palette.length)];
        burstParticles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 4 + Math.random() * 8,
          alpha: 1,
          life: 0,
          maxLife: 40 + Math.random() * 20,
          r: color.r,
          g: color.g,
          b: color.b,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    // Touch events removed on mobile — mouse interaction is disabled on mobile anyway,
    // so these listeners are dead code. This saves event-handler overhead on mobile browsers.

    const draw = (timestamp: number) => {
      if (!isRunning) return;

      // Frame rate cap: skip frame if not enough time has elapsed
      if (timestamp - lastFrameTime < FRAME_INTERVAL) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      lastFrameTime = timestamp;

      ctx.clearRect(0, 0, width, height);

      // Re-render background cache on theme change or resize — reads from ref
      const currentTheme = themeRef.current;
      if (lastBgColor !== currentTheme || bgCache.width !== width || bgCache.height !== height) {
        lastBgColor = currentTheme;
        renderBgCache();
      }
      // Use cached background via drawImage — avoids createRadialGradient in animation loop
      ctx.drawImage(bgCache, 0, 0);

      const palette = getColors(currentTheme);
      const isReducedMotion = reducedMotionRef.current;
      const hasWind = !isReducedMotion && mouse.active && (Math.abs(mouse.windX) > 0.5 || Math.abs(mouse.windY) > 0.5);

      // ─── Static render for reduced motion ──────────────────────────────────
      if (isReducedMotion) {
        particles.forEach((p) => {
          // Smoothly interpolate color coordinates to follow theme updates
          const colorSpeed = 0.05;
          p.r += (p.targetR - p.r) * colorSpeed;
          p.g += (p.targetG - p.g) * colorSpeed;
          p.b += (p.targetB - p.b) * colorSpeed;

          const currentX = p.x + Math.sin(p.swayOffset) * p.swayAmount * p.depth;
          const drawSize = p.size * p.depth;
          const drawAlpha = p.alpha * (0.7 + 0.3 * p.depth);
          const glowCanvas = getParticleGlowCanvas(p.r, p.g, p.b, drawAlpha, drawSize);
          ctx.drawImage(glowCanvas, currentX - drawSize, p.y - drawSize);
        });

        // Still draw burst particles in reduced motion (they are temporary and low-motion)
        for (let i = burstParticles.length - 1; i >= 0; i--) {
          const bp = burstParticles[i];
          bp.life++;
          bp.x += bp.vx;
          bp.y += bp.vy;
          bp.vx *= 0.95;
          bp.vy *= 0.95;
          bp.alpha = 1 - (bp.life / bp.maxLife);
          if (bp.life >= bp.maxLife) {
            burstParticles.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.globalAlpha = bp.alpha * 0.8;
          const glowCanvas = getParticleGlowCanvas(bp.r, bp.g, bp.b, bp.alpha, bp.size);
          ctx.drawImage(glowCanvas, bp.x - bp.size, bp.y - bp.size);
          ctx.restore();
        }

        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      // ─── Full animation render ─────────────────────────────────────────────
      // Render & Update particles
      particles.forEach((p) => {
        // Smoothly interpolate color coordinates to follow theme updates
        const colorSpeed = 0.05;
        p.r += (p.targetR - p.r) * colorSpeed;
        p.g += (p.targetG - p.g) * colorSpeed;
        p.b += (p.targetB - p.b) * colorSpeed;

        // Sway back and forth using sine wave
        p.swayOffset += p.swaySpeed;
        const currentX = p.x + Math.sin(p.swayOffset) * p.swayAmount * p.depth;

        // Depth-adjusted draw size and alpha
        let drawSize = p.size * p.depth;
        let drawAlpha = p.alpha * (0.7 + 0.3 * p.depth);

        // Mouse proximity glow, repulse, and wind effect
        // Disabled entirely on mobile to reduce CPU/GPU load
        if (mouse.active && !isMobile) {
          const dx = mouse.x - currentX;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;
          const interactRadius = 160 * p.depth;
          const interactRadiusSq = interactRadius * interactRadius;
          if (distSq < interactRadiusSq && distSq > 0.1) {
            const factor = 1 - distSq / interactRadiusSq;
            // Glow boost: brighter and larger near cursor
            drawAlpha *= 1 + factor * 0.8;
            drawSize *= 1 + factor * 0.4;
            // Repulse: push away from cursor (stronger than before)
            const repulse = factor * 0.02;
            const invDist = 1 / Math.sqrt(distSq);
            p.vx -= dx * invDist * repulse;
            p.vy -= dy * invDist * repulse;
          }
          // Wind drift: particles shift in the direction of mouse movement
          const windRadius = 280 * p.depth;
          const windRadiusSq = windRadius * windRadius;
          if (distSq < windRadiusSq && hasWind) {
            const windFactor = 1 - distSq / windRadiusSq;
            p.vx += mouse.windX * windFactor * 0.003 * p.depth;
            p.vy += mouse.windY * windFactor * 0.003 * p.depth;
          }
        }

        // Scroll velocity influence (parallax wind)
        p.vy += scrollVelocityRef.current * 0.12 * p.depth;

        // Spring-back: particles gently return toward their original position
        const springStrength = 0.006;
        const homeDx = p.originalX - p.x;
        const homeDy = p.originalY - p.y;
        p.vx += homeDx * springStrength;
        p.vy += homeDy * springStrength;

        // Friction to dampen accumulated velocity
        p.vx *= 0.995;
        p.vy *= 0.995;

        // Apply velocity to position (BUG FIX: original code never applied vx to x)
        p.x += p.vx * p.depth;
        p.y += p.vy * p.depth;

        // Update trail using the new visual position (disabled on mobile for perf)
        const newCurrentX = p.x + Math.sin(p.swayOffset) * p.swayAmount * p.depth;
        if (!isMobile) {
          p.trail.push({ x: newCurrentX, y: p.y });
          if (p.trail.length > 8) p.trail.shift();

          // Draw trail
          if (p.trail.length > 2) {
            ctx.save();
            ctx.globalAlpha = 0.12 * p.depth;
            ctx.strokeStyle = `rgba(${Math.round(p.r)}, ${Math.round(p.g)}, ${Math.round(p.b)}, 0.4)`;
            ctx.lineWidth = 2 * p.depth;
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let i = 1; i < p.trail.length; i++) {
              ctx.lineTo(p.trail[i].x, p.trail[i].y);
            }
            ctx.stroke();
            ctx.restore();
          }
        }

        // Draw from cached particle glow canvas via drawImage
        const glowCanvas = getParticleGlowCanvas(p.r, p.g, p.b, drawAlpha, drawSize);
        ctx.drawImage(glowCanvas, currentX - drawSize, p.y - drawSize);

        // Sparkle effect on some particles (disabled on mobile for perf)
        if (p.isSparkle && !isMobile) {
          const sparkleSine = Math.sin(p.swayOffset * 5);
          if (sparkleSine > 0.82) {
            const sparkleSize = drawSize * 0.35;
            const sparkleAlpha = Math.min(1, (sparkleSine - 0.82) * 4);
            ctx.save();
            ctx.globalAlpha = sparkleAlpha;
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 1.5 * p.depth;
            ctx.beginPath();
            ctx.moveTo(currentX - sparkleSize, p.y);
            ctx.lineTo(currentX + sparkleSize, p.y);
            ctx.moveTo(currentX, p.y - sparkleSize);
            ctx.lineTo(currentX, p.y + sparkleSize);
            ctx.stroke();
            ctx.restore();
          }
        }

        // If a particle moves off screen, wrap it around
        const baseSize = p.size * p.depth;
        if (p.y < -baseSize * 2) {
          p.y = height + drawSize * 2;
          p.x = Math.random() * width;
          // Reset original position to a visible spot so spring-back pulls upward
          p.originalX = p.x;
          p.originalY = Math.random() * height;
          const newColor = palette[Math.floor(Math.random() * palette.length)];
          p.r = p.targetR = newColor.r;
          p.g = p.targetG = newColor.g;
          p.b = p.targetB = newColor.b;
          p.trail = [];
        }
        if (p.x < -baseSize * 2) {
          p.x = width + baseSize * 2;
          p.originalX = p.x;
        }
        if (p.x > width + baseSize * 2) {
          p.x = -baseSize * 2;
          p.originalX = p.x;
        }

        // Randomly modulate alpha for a prominent twinkling glow effect
        const newAlpha = p.baseAlpha * (0.70 + Math.sin(p.swayOffset * 3) * 0.30);
        // Only invalidate particle cache when alpha changes significantly
        if (Math.abs(p.alpha - newAlpha) > 0.02) {
          p.alpha = newAlpha;
        }
      });

      // Draw connection lines between nearby particles (disabled on mobile for perf)
      // Spatial grid for O(n) lookup
      if (!isMobile) {
      const maxConnections = 3;
      const connectionDist = 100;
      const cellSize = connectionDist;
      const grid = new Map<string, number[]>();

      // Populate spatial grid
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const px = p.x + Math.sin(p.swayOffset) * p.swayAmount * p.depth;
        const cellX = Math.floor(px / cellSize);
        const cellY = Math.floor(p.y / cellSize);
        const key = `${cellX}_${cellY}`;
        let bucket = grid.get(key);
        if (!bucket) {
          bucket = [];
          grid.set(key, bucket);
        }
        bucket.push(i);
      }

      // Check each particle against its own and adjacent cells
      const lineColor = currentTheme === "light" ? "rgba(27, 64, 121, 0.4)" : "rgba(255, 255, 255, 0.4)";
      const drawn = new Set<string>();

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const x1 = p1.x + Math.sin(p1.swayOffset) * p1.swayAmount * p1.depth;
        const y1 = p1.y;
        const cellX = Math.floor(x1 / cellSize);
        const cellY = Math.floor(y1 / cellSize);
        let connections = 0;

        // Check 3x3 neighborhood
        for (let dx = -1; dx <= 1 && connections < maxConnections; dx++) {
          for (let dy = -1; dy <= 1 && connections < maxConnections; dy++) {
            const key = `${cellX + dx}_${cellY + dy}`;
            const bucket = grid.get(key);
            if (!bucket) continue;

            for (const j of bucket) {
              if (j <= i) continue;
              const pairKey = i < j ? `${i}_${j}` : `${j}_${i}`;
              if (drawn.has(pairKey)) continue;

              const p2 = particles[j];
              const x2 = p2.x + Math.sin(p2.swayOffset) * p2.swayAmount * p2.depth;
              const y2 = p2.y;
              const ddx = x1 - x2;
              const ddy = y1 - y2;
              const dist = Math.sqrt(ddx * ddx + ddy * ddy);

              if (dist < connectionDist) {
                const opacity = (1 - dist / connectionDist) * 0.15;
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.restore();
                drawn.add(pairKey);
                connections++;
              }
            }
          }
        }
      }
      }  // end if (!isMobile) — skip connection lines on mobile for perf

      // Draw burst particles
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const bp = burstParticles[i];
        bp.life++;
        bp.x += bp.vx;
        bp.y += bp.vy;
        bp.vx *= 0.95;
        bp.vy *= 0.95;
        bp.alpha = 1 - (bp.life / bp.maxLife);
        if (bp.life >= bp.maxLife) {
          burstParticles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = bp.alpha * 0.8;
        const burstGrad = ctx.createRadialGradient(bp.x, bp.y, 0, bp.x, bp.y, bp.size);
        burstGrad.addColorStop(0, `rgba(${bp.r}, ${bp.g}, ${bp.b}, ${bp.alpha})`);
        burstGrad.addColorStop(0.5, `rgba(${bp.r}, ${bp.g}, ${bp.b}, ${bp.alpha * 0.4})`);
        burstGrad.addColorStop(1, `rgba(${bp.r}, ${bp.g}, ${bp.b}, 0)`);
        ctx.fillStyle = burstGrad;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }



      // Decay velocities each frame so they die out when movement stops
      mouse.windX *= 0.96;
      mouse.windY *= 0.96;
      scrollVelocityRef.current *= 0.92;

      animationFrameId = requestAnimationFrame(draw);
    };

    // Pause animation when tab is hidden to save CPU/GPU
    const handleVisibility = () => {
      if (document.hidden) {
        isRunning = false;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      } else {
        isRunning = true;
        animationFrameId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // IntersectionObserver: pause rendering when canvas is scrolled out of viewport
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!isRunning) {
            isRunning = true;
            animationFrameId = requestAnimationFrame(draw);
          }
        } else {
          isRunning = false;
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
        }
      },
      { threshold: 0.01 }
    );
    intersectionObserver.observe(canvas);

    animationFrameId = requestAnimationFrame(draw);

    // Update particle target colors when theme changes (via MutationObserver + event listeners above)
    const updateTargetColors = () => {
      const palette = getColors(themeRef.current);
      particles.forEach((p) => {
        const color = palette[Math.floor(Math.random() * palette.length)];
        p.targetR = color.r;
        p.targetG = color.g;
        p.targetB = color.b;
      });
      // Also re-render the background cache for the new theme
      lastBgColor = themeRef.current;
      renderBgCache();
    };
    window.addEventListener("tanglaw-theme-change", updateTargetColors);
    window.addEventListener("storage", updateTargetColors);

    return () => {
      if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("tanglaw-theme-change", updateTargetColors);
      window.removeEventListener("storage", updateTargetColors);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);

      if (resizeTimeout) clearTimeout(resizeTimeout);
      intersectionObserver.disconnect();
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [pathname]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none fixed inset-0 z-[1] transition-opacity duration-700 ${className ?? ""}`}
      style={{ filter: `var(${GLOW_CSS_VAR})` }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
