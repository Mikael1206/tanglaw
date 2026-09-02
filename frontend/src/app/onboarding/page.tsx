"use client";

/**
 * Onboarding page for new students.
 * Hosts the 'System Initialization' sequence within the project's technical grid.
 */
import React from "react";
import InitializationTerminal from "@/components/initialization-terminal";
import AuthGuard from "@/components/AuthGuard";

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <div className="relative min-h-screen bg-[color:var(--theme-canvas)] grid-blueprint py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Structural Overlays */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[color:var(--theme-canvas)] via-transparent to-[color:var(--theme-canvas)]" />
        
        <main className="relative z-10 mx-auto max-w-7xl">
          <header className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-3 border-technical bg-white px-6 py-2 text-[10px] uppercase tracking-[0.4em] text-primary font-black shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              Secure Authorization // Entry-Point
            </div>
            <h1 className="font-display text-4xl font-black tracking-technical text-[color:var(--theme-typography-main)] sm:text-6xl uppercase">
              System Initialization
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[color:var(--theme-text-muted)] max-w-xl mx-auto">
              Please calibrate your academic and financial parameters to unlock the scholarship navigation stream.
            </p>
          </header>

          <InitializationTerminal />
        </main>
      </div>
    </AuthGuard>
  );
}
