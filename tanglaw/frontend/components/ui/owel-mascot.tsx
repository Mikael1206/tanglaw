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
      {/* Light Theme Image — visible when NOT dark */}
      <Image
        src="/assets/owel-full-body2.0.png"
        alt="Owel Mascot (Light Theme)"
        width={MASCOT_SIZE}
        height={MASCOT_SIZE}
        className={cn(
          "absolute inset-0 object-contain select-none pointer-events-none transition-opacity duration-700 ease-in-out",
          isDark ? "opacity-0" : "opacity-100"
        )}
        priority
      />

      {/* Dark Theme Image — visible when dark */}
      <Image
        src="/assets/owel-full-body.png"
        alt="Owel Mascot (Dark Theme)"
        width={MASCOT_SIZE}
        height={MASCOT_SIZE}
        className={cn(
          "absolute inset-0 object-contain select-none pointer-events-none transition-opacity duration-700 ease-in-out",
          isDark ? "opacity-100" : "opacity-0"
        )}
        priority
      />
    </div>
  );
}
