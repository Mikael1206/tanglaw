"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import "./GooeyNav.css";

export interface GooeyNavItem {
  label: string;
  href: string;
  ariaLabel?: string;
}

export interface GooeyNavProps {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: (number | string)[];
  initialActiveIndex?: number;
  activeHref?: string;
  className?: string;
  onItemClick?: (item: GooeyNavItem, index: number, e: React.MouseEvent) => void;
}

const GooeyNav: React.FC<GooeyNavProps> = ({
  items = [],
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
  activeHref,
  className = "",
  onItemClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const timeoutsRef = useRef<number[]>([]);

  // Compute initial active index taking activeHref into account
  const computeActiveIndex = useCallback(() => {
    if (activeHref !== undefined) {
      const idx = items.findIndex((it) => it.href === activeHref);
      return idx;
    }
    return initialActiveIndex >= 0 && initialActiveIndex < items.length
      ? initialActiveIndex
      : 0;
  }, [activeHref, items, initialActiveIndex]);

  const [activeIndex, setActiveIndex] = useState<number>(computeActiveIndex);

  // Sync activeIndex with activeHref during render (React 19 compliant)
  const [prevActiveHref, setPrevActiveHref] = useState<string | undefined>(activeHref);
  if (activeHref !== undefined && prevActiveHref !== activeHref) {
    setPrevActiveHref(activeHref);
    const foundIdx = items.findIndex((it) => it.href === activeHref);
    if (foundIdx !== -1 && foundIdx !== activeIndex) {
      setActiveIndex(foundIdx);
    }
  }

  const makeParticles = useCallback((element: HTMLElement) => {
    const noise = (n = 1) => n / 2 - Math.random() * n;

    const getXY = (distance: number, pointIndex: number, totalPoints: number) => {
      const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
      return [distance * Math.cos(angle), distance * Math.sin(angle)];
    };

    const createParticle = (i: number, t: number, d: [number, number], r: number) => {
      const rotate = noise(r / 10);
      return {
        start: getXY(d[0], particleCount - i, particleCount),
        end: getXY(d[1] + noise(7), particleCount - i, particleCount),
        time: t,
        scale: 1 + noise(0.2),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
      };
    };

    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty("--time", `${bubbleTime}ms`);

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove("active");

      const spawnTimer = window.setTimeout(() => {
        const particle = document.createElement("span");
        const point = document.createElement("span");
        particle.classList.add("particle");
        particle.style.setProperty("--start-x", `${p.start[0]}px`);
        particle.style.setProperty("--start-y", `${p.start[1]}px`);
        particle.style.setProperty("--end-x", `${p.end[0]}px`);
        particle.style.setProperty("--end-y", `${p.end[1]}px`);
        particle.style.setProperty("--time", `${p.time}ms`);
        particle.style.setProperty("--scale", `${p.scale}`);

        const colorProp =
          typeof p.color === "number"
            ? `var(--color-${p.color}, var(--theme-primary, #1B4079))`
            : String(p.color);
        particle.style.setProperty("--color", colorProp);
        particle.style.setProperty("--rotate", `${p.rotate}deg`);

        point.classList.add("point");
        particle.appendChild(point);
        element.appendChild(particle);

        requestAnimationFrame(() => {
          element.classList.add("active");
        });

        const cleanupTimer = window.setTimeout(() => {
          try {
            if (particle.parentElement === element) {
              element.removeChild(particle);
            }
          } catch {
            // Ignore if already removed
          }
        }, t);
        timeoutsRef.current.push(cleanupTimer);
      }, 30);
      timeoutsRef.current.push(spawnTimer);
    }
  }, [animationTime, colors, particleCount, particleDistances, particleR, timeVariance]);

  const updateEffectPosition = useCallback((element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    if (pos.width === 0 && pos.height === 0) return;

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };
    Object.assign(filterRef.current.style, styles);
    if (textRef.current) {
      Object.assign(textRef.current.style, styles);
      textRef.current.innerText = element.innerText;
    }
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number, item: GooeyNavItem) => {
    const liEl = (e.currentTarget as HTMLElement).closest("li") || e.currentTarget.parentElement;
    if (activeIndex === index) {
      onItemClick?.(item, index, e);
      return;
    }

    setActiveIndex(index);
    if (liEl) {
      updateEffectPosition(liEl);
    }

    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll(".particle");
      particles.forEach((p) => {
        try {
          filterRef.current?.removeChild(p);
        } catch {
          // Ignore
        }
      });
    }

    if (textRef.current) {
      textRef.current.classList.remove("active");
      void textRef.current.offsetWidth;
      textRef.current.classList.add("active");
    }

    if (filterRef.current) {
      makeParticles(filterRef.current);
    }

    onItemClick?.(item, index, e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number, item: GooeyNavItem) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const liEl = (e.currentTarget as HTMLElement).closest("li") || e.currentTarget.parentElement;
      if (liEl) {
        handleClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, index, item);
      }
    }
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const itemsList = navRef.current.querySelectorAll("li");
    const activeLi = activeIndex >= 0 && activeIndex < itemsList.length ? itemsList[activeIndex] : null;

    if (activeLi) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add("active");
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentList = navRef.current?.querySelectorAll("li");
      const currentActiveLi =
        currentList && activeIndex >= 0 && activeIndex < currentList.length
          ? currentList[activeIndex]
          : null;
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex, updateEffectPosition]);

  // Clean up timers on unmount
  useEffect(() => {
    const timers = timeoutsRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  const hasActive = activeIndex >= 0 && activeIndex < items.length;

  return (
    <div
      className={`gooey-nav-container ${className}`.trim()}
      ref={containerRef}
      data-has-active={hasActive ? "true" : "false"}
    >
      <nav aria-label="Main Navigation">
        <ul ref={navRef}>
          {items.map((item, index) => {
            const isExternal =
              item.href.startsWith("http://") || item.href.startsWith("https://");
            const isActive = activeIndex === index;

            return (
              <li key={index} className={isActive ? "active" : ""}>
                {isExternal ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.ariaLabel || item.label}
                    onClick={(e) => handleClick(e, index, item)}
                    onKeyDown={(e) => handleKeyDown(e, index, item)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    aria-label={item.ariaLabel || item.label}
                    onClick={(e) => handleClick(e, index, item)}
                    onKeyDown={(e) => handleKeyDown(e, index, item)}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <span className="effect filter" ref={filterRef} />
      <span className="effect text" ref={textRef} />

      <svg className="gooey-nav-svg-filter">
        <defs>
          <filter id="gooey-nav-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -6"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default GooeyNav;
