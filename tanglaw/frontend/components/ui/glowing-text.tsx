'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowingTextProps {
  children: React.ReactNode;
  className?: string;
  /** Allows flexibility for different levels of emphasis */
  glowType?: 'primary' | 'secondary' | 'accent';
}

export function GlowingText({ children, className, glowType = 'primary' }: GlowingTextProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>{children}</span>;
  }

  const isDark = resolvedTheme === 'dark';

  // TANGLAW Brand Glow Configurations
  const getGlowStyles = () => {
    if (isDark) {
      switch (glowType) {
        case 'secondary': return '0 0 14px rgba(167, 139, 250, 0.7)'; // Soft Owel Purple
        case 'accent': return '0 0 14px rgba(255, 255, 255, 0.7)'; // Glowing White
        case 'primary':
        default: return '0 0 14px rgba(255, 215, 0, 0.6)'; // Star Gold
      }
    } else {
      switch (glowType) {
        case 'secondary': return '0 0 14px rgba(15, 23, 42, 0.3)'; // Deep Navy
        case 'accent': return '0 0 14px rgba(255, 255, 255, 0.9)'; // Pure White
        case 'primary':
        default: return '0 0 14px rgba(29, 78, 216, 0.4)'; // Royal Blue
      }
    }
  };

  return (
    <motion.span
      className={cn('transition-all duration-700 ease-in-out', className)}
      style={{ textShadow: getGlowStyles() }}
      animate={{
        // Subtle opacity pulse — makes the glow "breathe" without affecting text readability
        opacity: [0.92, 1, 0.92],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.span>
  );
}
