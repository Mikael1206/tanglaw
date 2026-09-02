'use client';

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface GlowingTextProps {
  children: React.ReactNode;
  className?: string;
  glowType?: 'primary' | 'secondary' | 'accent';
}

const glowClasses = {
  primary: 'glow-primary',
  secondary: 'glow-secondary',
  accent: 'glow-accent',
};

export function GlowingText({ children, className, glowType = 'primary' }: GlowingTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
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

  return (
    <span
      ref={containerRef}
      className={cn(
        'animate-glow-pulse', 
        !isInView && 'animate-glow-pause',
        glowClasses[glowType], 
        className
      )}
    >
      {children}
    </span>
  );
}
