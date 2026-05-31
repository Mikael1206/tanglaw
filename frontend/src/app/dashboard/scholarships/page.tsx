"use client";

/**
 * Dashboard scholarship page mounting the scholarship discovery browser.
 */
import ScholarshipBrowser from "@/components/scholarship-browser";
import { motion } from "framer-motion";

export default function DashboardScholarshipsPage() {
  return (
    <div className="space-y-8">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        className="rounded-[2rem] border border-accent-muted/30 bg-white p-8 shadow-2xl"
      >
        <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Scholarship Directory</p>
        <h1 className="font-display text-3xl font-black text-zinc-900 mt-3">Your gated grant discovery environment</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600 max-w-3xl">
          Access the secure scholarship browser with filters, eligibility indicators, and curated grant resources reserved for authenticated users.
        </p>
      </motion.header>
      <ScholarshipBrowser />
    </div>
  );
}
