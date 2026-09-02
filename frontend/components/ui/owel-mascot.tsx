'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OwelMascotProps {
  className?: string;
}

const MASCOT_SIZE = 520;

export function OwelMascot({ className }: OwelMascotProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn("relative w-full", className)}
        style={{ maxWidth: MASCOT_SIZE, aspectRatio: '1 / 1' }}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className={cn("relative w-full", className)}
      style={{
        maxWidth: MASCOT_SIZE,
        aspectRatio: '1 / 1',
        filter:
          'drop-shadow(0 0 30px rgba(184,201,232,0.25)) drop-shadow(0 0 60px rgba(184,201,232,0.1))',
      }}
    >
      {/* Single theme image — loads only the active theme's mascot */}
      <Image
        src={isDark ? "/assets/owel-full-body.webp" : "/assets/owel-full-body2.0.webp"}
        alt="Owel Mascot"
        width={MASCOT_SIZE}
        height={MASCOT_SIZE}
        sizes="(max-width: 640px) 256px, (max-width: 1024px) 400px, 520px"
        className="absolute inset-0 object-contain select-none pointer-events-none transition-opacity duration-700 ease-in-out"
        priority
      />
    </div>
  );
}
