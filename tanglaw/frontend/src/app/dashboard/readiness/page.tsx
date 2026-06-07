"use client";

/**
 * Dashboard readiness page embedding the interactive quiz component.
 */
import ReadinessForm from "@/components/readiness-form";
import ScrollReveal from "@/components/scroll-reveal";
import { GlowingText } from "../../../../components/ui/glowing-text";

export default function DashboardReadinessPage() {
  return (
    <div className="space-y-6 lg:space-y-8 w-full max-w-full overflow-x-hidden">
      <ScrollReveal direction="up" delay={0}>
        <header className="px-4 sm:px-0">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[color:var(--theme-typography-secondary)] font-black"><GlowingText glowType="secondary" className="text-[color:var(--theme-typography-secondary)]">Readiness Check</GlowingText></p>
          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black text-[color:var(--theme-typography-main)] mt-3 break-words"><GlowingText glowType="primary">Secure evaluation and study readiness</GlowingText></h1>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed text-[color:var(--theme-text-body)] max-w-3xl">
            Run through our adaptive readiness check module and identify the subject areas that need the most preparation before scholarship examinations.
          </p>
        </header>
      </ScrollReveal>
      <ScrollReveal direction="up" delay={0.15}>
        <div className="w-full">
          <ReadinessForm />
        </div>
      </ScrollReveal>
    </div>
  );
}
