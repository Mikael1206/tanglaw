"use client";

/**
 * Public landing page for the TANGLAW application.
 * Presents product messaging, navigation, and hero content.
 */
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden min-h-screen bg-[color:var(--theme-canvas)] font-sans text-[color:var(--theme-text-body)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(27,64,121,0.16),_transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.08),_transparent_16%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_85%,_rgba(38,98,172,0.12),_transparent_20%)]" />

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_0.85fr] items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-[color:var(--theme-typography-secondary)] font-black shadow-lg shadow-black/20">
                TANGLAW · SCHOLARSHIP COMPASS
              </div>
              <div className="max-w-3xl space-y-6">
                <h1 className="font-display text-6xl font-black tracking-tight text-[color:var(--theme-typography-main)] md:text-8xl">
                  TANGLAW
                </h1>
                <p className="text-lg font-medium leading-8 text-[color:var(--theme-typography-secondary)] md:text-xl">
                  Scholarship access with the clarity of a guiding light.
                </p>
                <div className="text-sm max-w-xl text-balance mt-4 opacity-80 leading-7 text-[color:var(--theme-text-body)]">
                  Built specifically for tertiary students, TANGLAW unifies granular scholarship directories, natural language verification, and mock screening tools into a unified portal—streamlining localized financial aid navigation and closing information gaps across higher education.
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => router.push("/signup")}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-[0.24em] text-white shadow-2xl shadow-black/20 transition duration-200 hover:bg-primary-hover"
                >
                  Begin your journey
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => router.push("/about")}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[color:var(--theme-typography-main)] shadow-2xl shadow-black/15 transition duration-200 hover:bg-white/10"
                >
                  Explore the roadmap
                </motion.button>
              </div>

              <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--theme-typography-secondary)]">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">Scholarship Finder</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">AI Navigator</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">Readiness Check</span>
              </div>
            </div>

            <div className="flex justify-center">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/assets/owel-full.png"
                  alt="Owel Mascot"
                  width={520}
                  height={520}
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>
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
            ].map((item) => (
              <article key={item.title} className="rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)] p-6 shadow-xl shadow-black/20 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-bold">{item.title}</p>
                <p className="mt-4 text-sm leading-7 text-[color:var(--theme-text-body)]">{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
