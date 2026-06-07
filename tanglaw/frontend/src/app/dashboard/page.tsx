"use client";

/**
 * Authenticated dashboard home page.
 * Serves as the main hub for the student's scholarship tools.
 *
 * Layout strategy:
 *  - Mobile (grid-cols-1): Welcome (order-1) → Owel (order-2) → Scholarship (order-3) → Readiness (order-4)
 *  - Desktop (lg:grid-cols-3): Asymmetric 3-column grid
 *      ┌─────────────────────────┬────────────┐
 *      │ Welcome (col-span-2)    │ Owel       │
 *      │                         │ (col-span-1│
 *      ├────────────┬────────────┤  row-span-2)│
 *      │ Scholarship│ Readiness  │            │
 *      │ Directory  │ Check      │            │
 *      │ (nested    │ (nested    │            │
 *      │  md:grid-  │  md:grid-  │            │
 *      │  cols-2)   │  cols-2)   │            │
 *      └────────────┴────────────┴────────────┘
 */
import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { BookOpen, ShieldCheck, Sparkles, MessageCircle, X } from "lucide-react";
import OwelChatbot from "@/components/owel-chatbot";
import { GlowingText } from "../../../components/ui/glowing-text";

export default function DashboardHomePage() {
  const [chatOpen, setChatOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const openChat = () => {
    setChatOpen(true);
    setTimeout(() => closeButtonRef.current?.focus(), 300);
  };

  return (
    <>
      {/* ── Outer grid shell ──
          Mobile: single column with order-* reordering
          Desktop (lg:): asymmetric 3-column grid
            Col 1-2: Workspace area (Welcome + nested cards)
            Col 3:   Owel sidebar (spans both rows)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full">

        {/* ══════════════════════════════════════════════════════════════════
           SECTION 1: Authenticated Workspace Banner
           order-1 on mobile, spans Col 1-2 Row 1 on desktop
           ══════════════════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="order-1 lg:order-none lg:col-span-2 rounded-[2rem] border border-accent-muted/30 bg-[color:var(--theme-surface)] p-5 sm:p-6 lg:p-8 shadow-2xl"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3 sm:space-y-4">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[color:var(--theme-text-muted)] font-bold">Authenticated Workspace</p>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[color:var(--theme-typography-main)] break-words">
                <GlowingText glowType="primary">Welcome back to the TANGLAW Scholar Hub</GlowingText>
              </h1>
              <p className="max-w-2xl text-xs sm:text-sm text-[color:var(--theme-text-body)] leading-relaxed">
                Your secure access point for scholarship discovery, readiness diagnostics, and the new consolidated Readiness Check. Use the dashboard navigation to launch tools that are reserved for authenticated users.
              </p>
            </div>
            <div className="rounded-[2rem] border border-primary/10 bg-primary/5 px-4 sm:px-5 py-4 text-sm text-primary shadow-sm md:max-w-xs flex-shrink-0 w-full md:w-auto">
              <p className="font-semibold text-primary"><GlowingText glowType="secondary">Live Module Access</GlowingText></p>
              <p className="mt-2 text-[color:var(--theme-text-body)] text-xs leading-relaxed">
                Launch the AI Scholarship Chatbot, benchmark your readiness, or begin the simulation from within the dashboard only.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════════════
           SECTION 2: Owel Assistant Sidebar
           order-2 on mobile (between Welcome + cards),
           lg:col-span-1 lg:row-span-2 on desktop (right column, full height)
           ══════════════════════════════════════════════════════════════════ */}
        <div className="order-2 lg:order-none lg:col-span-1 lg:row-span-2">
          <div className="rounded-[2rem] border-2 border-primary/20 bg-primary/5 p-5 sm:p-6 lg:p-8 shadow-xl flex flex-col justify-between space-y-5 sm:space-y-6 h-full">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex h-14 sm:h-16 w-14 sm:w-16 items-center justify-center rounded-full bg-[color:var(--theme-surface)] shadow-lg border-2 border-accent-periwinkle/50">
                <Image
                  src="/assets/owel-head.png"
                  alt="Owel Mascot"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[color:var(--theme-typography-main)]"><GlowingText glowType="secondary">Owel Assistant</GlowingText></h3>
              <p className="text-xs sm:text-sm leading-relaxed text-[color:var(--theme-text-body)]">
                Need academic navigation guidance? Owel answers eligibility questions, simplifies grant terms, and recommends next steps tailored for you.
              </p>
            </div>

            <button
              onClick={openChat}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3.5 sm:py-4 rounded-full font-black border-2 border-accent-muted shadow-lg cursor-pointer transition-all hover:scale-[1.01] text-xs sm:text-sm"
            >
              <MessageCircle className="h-4 sm:h-5 w-4 sm:w-5" /> Launch Owel Assistant
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
           SECTION 3: Cards Wrapper (Scholarship + Readiness)
           order-3 on mobile, spans Col 1-2 Row 2 on desktop
           Inner sub-grid: side-by-side on md:, stacked on mobile
           ══════════════════════════════════════════════════════════════════ */}
        <div className="order-3 lg:order-none lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── 3a. Scholarship Directory Card ── */}
          <motion.article
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="group rounded-[2rem] border border-accent-muted/30 bg-[color:var(--theme-surface)] p-5 sm:p-6 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-3xl bg-primary text-white shadow-lg mb-5">
                <BookOpen className="h-5 sm:h-6 w-5 sm:w-6" />
              </div>
              <h2 className="font-black text-lg sm:text-xl text-[color:var(--theme-typography-main)] mb-3 break-words"><GlowingText glowType="secondary">Scholarship Directory</GlowingText></h2>
              <p className="text-xs sm:text-sm text-[color:var(--theme-text-body)] leading-relaxed mb-6 min-h-[3rem]">
                Centralized grants finder with filtering, provider details, and application quick links.
              </p>
            </div>
            <Link
              href="/dashboard/scholarships"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-[0.24em] text-primary hover:text-primary-hover cursor-pointer"
            >
              Open Module <Sparkles className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
            </Link>
          </motion.article>

          {/* ── 3b. Readiness Check Card ── */}
          <motion.article
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="group rounded-[2rem] border border-accent-muted/30 bg-[color:var(--theme-surface)] p-5 sm:p-6 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-3xl bg-primary text-white shadow-lg mb-5">
                <ShieldCheck className="h-5 sm:h-6 w-5 sm:w-6" />
              </div>
              <h2 className="font-black text-lg sm:text-xl text-[color:var(--theme-typography-main)] mb-3 break-words"><GlowingText glowType="secondary">Readiness Check</GlowingText></h2>
              <p className="text-xs sm:text-sm text-[color:var(--theme-text-body)] leading-relaxed mb-6 min-h-[3rem]">
                Interactive mock assessment engine for exam readiness and competence mapping.
              </p>
            </div>
            <Link
              href="/dashboard/readiness"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-[0.24em] text-primary hover:text-primary-hover cursor-pointer"
            >
              Open Module <Sparkles className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
            </Link>
          </motion.article>

        </div>

      </div>

      {/* ── Owel Chat Modal ──────────────────────────────────────────────── */}
      {/* Always-mounted wrapper: chatbot state persists across open/close cycles */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 transition-all duration-300 ${
          chatOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!chatOpen}
      >
        {/* Backdrop with blur */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            chatOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setChatOpen(false)}
          aria-hidden="true"
        />

        {/* Modal panel */}
        <motion.div
          animate={chatOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.21, 1.02, 0.43, 1.01] }}
          className="relative w-full max-w-lg mx-2 sm:mx-0"
        >
          <button
            ref={closeButtonRef}
            onClick={() => setChatOpen(false)}
            className="absolute -top-3 -right-2 sm:-right-3 z-10 h-7 sm:h-8 w-7 sm:w-8 rounded-full bg-[color:var(--theme-surface)] border border-accent-muted/40 shadow-lg flex items-center justify-center hover:bg-base-pastel transition cursor-pointer"
            aria-label="Close chat"
          >
            <X className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-[color:var(--theme-text-body)]" />
          </button>

          <div className="max-h-[80vh] sm:max-h-[75vh] lg:max-h-[80vh]">
            <OwelChatbot variant="inline" />
          </div>
        </motion.div>
      </div>
    </>
  );
}
