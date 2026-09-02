"use client";

import { useRouter } from "next/navigation";
import ScrollReveal from "@/components/scroll-reveal";
import { GlowingText } from "../../components/ui/glowing-text";
import { HeroButton, MascotWithGlow, FeatureCard } from "../../components/ui/landing-animations";

const FEATURES = [
  {
    title: "Scholarship Discovery",
    description:
      "Browse grant opportunities, filter by academic standing, location, and program requirements.",
  },
  {
    title: "AI Guidance",
    description:
      "Get contextual answers from Owel, the intelligent companion built to simplify requirements and eligibility.",
  },
  {
    title: "Exam Readiness",
    description:
      "Track your preparation with interactive mock drills and analytics designed for scholarship performance.",
  },
];

export default function HomeClient() {
  const router = useRouter();

  return (
    <main className="relative z-10">
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_0.85fr] items-center">
          <div className="space-y-8">
            <div className="animate-stagger-1 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-[color:var(--theme-typography-secondary)] font-black shadow-lg shadow-black/20">
              TANGLAW · SCHOLARSHIP COMPASS
            </div>
            <div className="max-w-3xl space-y-6">
              <h1 className="animate-stagger-2 font-display text-6xl font-black tracking-tight text-[color:var(--theme-typography-main)] bg-clip-text bg-gradient-to-r from-primary via-[color:var(--theme-accent-periwinkle)] to-[color:var(--theme-typography-main)] md:text-8xl select-none">
                <GlowingText glowType="primary">TANGLAW</GlowingText>
              </h1>
              <p className="animate-stagger-3 text-lg font-medium leading-8 text-[color:var(--theme-typography-secondary)] md:text-xl">
                Scholarship access with the clarity of a{" "}
                <GlowingText glowType="secondary" className="font-semibold text-[color:var(--theme-typography-main)]">
                  guiding light
                </GlowingText>
                .
              </p>
              <div className="animate-stagger-4 text-sm max-w-xl text-balance mt-4 opacity-80 leading-7 text-[color:var(--theme-text-body)]">
                <GlowingText glowType="primary">
                  Built specifically for tertiary students, TANGLAW unifies granular scholarship directories, natural
                  language verification, and mock screening tools into a unified portal—streamlining localized financial
                  aid navigation and closing information gaps across higher education.
                </GlowingText>
              </div>
            </div>

            <div className="animate-stagger-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <HeroButton onClick={() => router.push("/signup")} variant="primary">
                Begin your journey
              </HeroButton>
              <HeroButton onClick={() => router.push("/about")} variant="secondary">
                Explore the roadmap
              </HeroButton>
            </div>

            <div className="animate-stagger-5 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--theme-typography-secondary)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                Scholarship Finder
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                AI Navigator
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                Readiness Check
              </span>
            </div>
          </div>

          <ScrollReveal direction="right" className="flex justify-center">
            <MascotWithGlow />
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((item, idx) => (
            <FeatureCard key={item.title} delay={0.08 * idx} direction="up" {...item} />
          ))}
        </div>
      </section>
    </main>
  );
}
