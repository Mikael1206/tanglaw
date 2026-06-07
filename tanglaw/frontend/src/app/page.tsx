"use client";

/**
 * Public landing page for the TANGLAW application.
 * Presents product messaging, navigation, and hero content.
 */
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/scroll-reveal";
import { EtheralShadow } from "../../components/ui/etheral-shadow";
import { OwelMascot } from "../../components/ui/owel-mascot";
import { GlowingText } from "../../components/ui/glowing-text";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden min-h-screen bg-[color:var(--theme-canvas)] font-sans text-[color:var(--theme-text-body)]">
      <EtheralShadow
        animation={{ scale: 60, speed: 80 }}
        noise={{ opacity: 0.8, scale: 1.0 }}
        sizing="cover"
        lightColor="rgba(200, 230, 175, 0.85)"
      />
      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_0.85fr] items-center">
            <ScrollReveal direction="left" className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-[color:var(--theme-typography-secondary)] font-black shadow-lg shadow-black/20">
                TANGLAW · SCHOLARSHIP COMPASS
              </div>
              <div className="max-w-3xl space-y-6">
                <h1 className="font-display text-6xl font-black tracking-tight text-[color:var(--theme-typography-main)] bg-clip-text bg-gradient-to-r from-primary via-[color:var(--theme-accent-periwinkle)] to-[color:var(--theme-typography-main)] md:text-8xl select-none">
                  <GlowingText glowType="primary">TANGLAW</GlowingText>
                </h1>
                <p className="text-lg font-medium leading-8 text-[color:var(--theme-typography-secondary)] md:text-xl">
                  Scholarship access with the clarity of a <GlowingText glowType="secondary" className="font-semibold text-[color:var(--theme-typography-main)]">guiding light</GlowingText>.
                </p>
                <div className="text-sm max-w-xl text-balance mt-4 opacity-80 leading-7 text-[color:var(--theme-text-body)]">
                  <GlowingText glowType="primary">Built specifically for tertiary students, TANGLAW unifies granular scholarship directories, natural language verification, and mock screening tools into a unified portal—streamlining localized financial aid navigation and closing information gaps across higher education.</GlowingText>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => router.push("/signup")}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-[0.24em] text-white shadow-2xl shadow-black/20 transition-all duration-300 hover:bg-primary-hover cursor-pointer shadow-[var(--theme-glow-primary)]"
                >
                  Begin your journey
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => router.push("/about")}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[color:var(--theme-typography-main)] shadow-2xl shadow-black/15 transition duration-200 hover:bg-white/10 cursor-pointer"
                >
                  Explore the roadmap
                </motion.button>
              </div>

              <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--theme-typography-secondary)]">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">Scholarship Finder</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">AI Navigator</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">Readiness Check</span>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="flex justify-center">
              <div className="relative flex items-center justify-center w-full">
                {/* Animated glow halo behind mascot */}
                <motion.div
                  className="absolute w-[85%] aspect-square rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(184,201,232,0.35) 0%, rgba(184,201,232,0.12) 40%, transparent 70%)',
                    filter: 'blur(60px)',
                    willChange: 'transform, opacity',
                  }}
                  animate={{
                    scale: [1, 1.12, 1],
                    opacity: [0.6, 0.9, 0.6],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                {/* Inner bright core glow */}
                <motion.div
                  className="absolute w-[50%] aspect-square rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)',
                    filter: 'blur(30px)',
                    willChange: 'transform, opacity',
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-full"
                >
                  <OwelMascot />
                </motion.div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
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
            ].map((item, idx) => (
              <ScrollReveal key={item.title} delay={0.15 * idx} direction="up">
                <article className="rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)] p-6 shadow-xl shadow-black/20 backdrop-blur-sm h-full hover:border-white/20 transition-all duration-300">
                  <p className="text-xs uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-bold">{item.title}</p>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--theme-text-body)]">{item.description}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
