"use client";

/**
 * Authenticated dashboard home page.
 * Serves as the main hub for the student's scholarship tools.
 */
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ShieldCheck, Sparkles, LayoutDashboard } from "lucide-react";

const MODULES = [
  {
    title: "Scholarship Directory",
    description: "Centralized grants finder with filtering, provider details, and application quick links.",
    href: "/dashboard/scholarships",
    icon: BookOpen,
  },
  {
    title: "Readiness Check",
    description: "Interactive mock assessment engine for exam readiness and competence mapping.",
    href: "/dashboard/readiness",
    icon: ShieldCheck,
  },
  {
    title: "Exam Reviewer Engine",
    description: "Timed practice workspace with dynamic analytics, question navigation, and performance review.",
    href: "/dashboard/reviewer",
    icon: LayoutDashboard,
  },
];

export default function DashboardHomePage() {
  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        className="rounded-[2rem] border border-accent-muted/30 bg-white p-8 shadow-2xl"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Authenticated Workspace</p>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-zinc-900">
              Welcome back to the TANGLAW Scholar Hub
            </h1>
            <p className="max-w-2xl text-sm text-zinc-600 leading-relaxed">
              Your secure access point for scholarship discovery, readiness diagnostics, and the new Exam Reviewer Engine. Use the dashboard navigation to launch tools that are reserved for authenticated users.
            </p>
          </div>
          <div className="rounded-[2rem] border border-primary/10 bg-primary/5 px-5 py-4 text-sm text-primary shadow-sm">
            <p className="font-semibold text-primary">Live Module Access</p>
            <p className="mt-2 text-zinc-600 text-sm">
              Launch the AI Scholarship Chatbot, benchmark your readiness, or begin the new reviewer simulation from within the dashboard only.
            </p>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 md:grid-cols-3">
        {MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <motion.article
              key={module.title}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="group rounded-[2rem] border border-accent-muted/30 bg-white p-6 shadow-2xl"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-primary text-white shadow-lg mb-5">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="font-black text-xl text-zinc-900 mb-3">{module.title}</h2>
              <p className="text-sm text-zinc-600 leading-relaxed mb-6">{module.description}</p>
              <Link
                href={module.href}
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-primary hover:text-primary-hover"
              >
                Open Module <Sparkles className="h-4 w-4" />
              </Link>
            </motion.article>
          );
        })}
      </section>
    </div>
  );
}
