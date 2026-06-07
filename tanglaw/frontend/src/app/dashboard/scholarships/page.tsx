"use client";

/**
 * Dashboard scholarship page mounting the scholarship discovery browser.
 */
import ScholarshipBrowser from "@/components/scholarship-browser";
import { motion } from "framer-motion";
import { GlowingText } from "../../../../components/ui/glowing-text";

export default function DashboardScholarshipsPage() {
  return (
    <div className="space-y-6 lg:space-y-8 max-w-full overflow-x-hidden">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        className="rounded-2xl sm:rounded-[2rem] border border-accent-muted/30 bg-white p-4 sm:p-6 lg:p-8 shadow-2xl"
      >
        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-bold"><GlowingText glowType="secondary" className="text-zinc-500">Scholarship Directory</GlowingText></p>
        <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 mt-3 break-words"><GlowingText glowType="primary">Your gated grant discovery environment</GlowingText></h1>
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed text-zinc-600 max-w-3xl">
          Access the secure scholarship browser with filters, eligibility indicators, and curated grant resources reserved for authenticated users.
        </p>
      </motion.header>
      <ScholarshipBrowser />
    </div>
  );
}
