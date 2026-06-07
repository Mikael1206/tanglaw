"use client";

/**
 * Dashboard readiness page embedding the interactive quiz component.
 */
import ReadinessForm from "@/components/readiness-form";
import { motion } from "framer-motion";

export default function DashboardReadinessPage() {
  return (
    <div className="space-y-8">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        className="rounded-2xl sm:rounded-[2rem] border border-accent-muted/30 bg-white p-4 sm:p-6 lg:p-8 shadow-2xl"
      >
        <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Interactive Readiness Check</p>
        <h1 className="font-display text-3xl font-black text-zinc-900 mt-3">Secure evaluation and study readiness</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600 max-w-3xl">
          Run through our adaptive readiness module and identify the subject areas that need the most preparation before scholarship examinations.
        </p>
      </motion.header>
      <div className="rounded-[2rem] border border-accent-muted/30 bg-white p-8 shadow-2xl">
        <ReadinessForm />
      </div>
    </div>
  );
}
