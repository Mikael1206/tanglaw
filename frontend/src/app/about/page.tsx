"use client";

/**
 * About page describing the project goals and team members.
 */
import Image from "next/image";
import { Users, BookOpen, Code, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const TEAM_DESCRIPTION = "A student-led research initiative that blends academic insight with scholarship navigation. We built TANGLAW to make grants easier to find, understand, and act on.";

const DOCUMENTATION_TEAM = [
  {
    name: "Godsent John C. Salvaloza",
    role: "Documentation Head",
    description: "Oversees all paper sections, references indexation, and final compiled academic paper validation.",
    username: "salvaloza",
  },
  {
    name: "Rhaine Venice B. Bonador",
    role: "Introduction Writer",
    description: "Handles Chapter 1 problem contexts, general socioeconomic gaps, and solution frameworks.",
    username: "bonador",
  },
  {
    name: "Kyle Ashley B. Madera",
    role: "Statement of the Problem Writer",
    description: "Transforms operational goals into measurable research questions, metrics, and study definitions.",
    username: "madera",
  },
  {
    name: "Hannah Mae V. Alberto",
    role: "RRL Lead Writer",
    description: "Manages literature review synthesis, source curation, and academic narrative alignment.",
    username: "alberto",
  },
  {
    name: "Hannah Nicole B. Partible",
    role: "RRL Assistant & Citation Checker",
    description: "Maintains reference accuracy, citation formatting, and academic consistency.",
    username: "partible",
  },
  {
    name: "Emerald T. Perez",
    role: "Methodology Writer",
    description: "Structures the research design, evaluation method, and analytical process.",
    username: "perez",
  },
  {
    name: "Julliane Mae G. Araullo",
    role: "Results Writer",
    description: "Compiles findings, performance metrics, and usability impact narratives.",
    username: "araullo",
  },
  {
    name: "Daniel F. Pajares",
    role: "Discussion Writer",
    description: "Explains implications, limitations, and future recommendations of the project.",
    username: "pajares",
  },
];

const DEVELOPMENT_TEAM = [
  {
    name: "Bennett P. Payoyo",
    role: "Project Manager",
    description: "Directs operational scope, research alignment, task delegation, and final deployment quality gates.",
    username: "payoyo",
  },
  {
    name: "An-joe Mikael T. Albano",
    role: "Frontend Developer",
    description: "Leads interface delivery, motion polish, and responsive behavior.",
    username: "albano",
  },
  {
    name: "Levrone Viel S. Delos Reyes",
    role: "Frontend & QA",
    description: "Supports UI quality checks, interaction validation, and accessibility review.",
    username: "delosreyes",
  },
  {
    name: "Charles Joseph V. Faustino",
    role: "Backend Developer & Database Manager",
    description: "Builds server interactions, data flow structure, and simulated persistence pathways.",
    username: "faustino",
  },
  {
    name: "Justin Angelo G. Cruz",
    role: "QA Tester / Technical Documentation",
    description: "Manages test matrices, documentation clarity, and final feature verification.",
    username: "cruz",
  },
];

const STATISTICS = [
  {
    label: "30.5%",
    description: "of Grade 3 learners show basic reading proficiency.",
  },
  {
    label: "0.47%",
    description: "of Grade 12 learners demonstrate grade-level readiness.",
  },
];

const BARRIERS = [
  {
    title: "Sensory Overload",
    description:
      "Traditional scholarship research is noisy, fragmented, and difficult for students who need clear, structured guidance.",
  },
  {
    title: "Executive Dysfunction",
    description:
      "Learners struggle to convert requirements into action when they lack step-by-step application support.",
  },
  {
    title: "Resource Gap",
    description:
      "Many students lack access to verified grant sources, eligibility summaries, and coaching tools in one place.",
  },
];

const PILLARS = [
  {
    number: "01",
    title: "Guided Scholarship Matching",
    description: "TANGLAW turns raw grant criteria into student-friendly matches and decision prompts.",
  },
  {
    number: "02",
    title: "Adaptive Readiness Check",
    description: "Interactive drills help students identify strengths, gaps, and high-impact review areas.",
  },
  {
    number: "03",
    title: "AI Navigation Companion",
    description: "Owel answers eligibility questions, simplifies terms, and recommends next steps.",
  },
  {
    number: "04",
    title: "Smart Scholarship Directory",
    description: "Filter grants by institution, funder type, and requirement intensity in one interface.",
  },
  {
    number: "05",
    title: "Review Engine & Analytics",
    description: "Practice modules and completion metrics keep learners motivated and accountable.",
  },
];

function CarouselSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="mb-24 relative">
      <div className="text-center mb-10">
        <p className="text-[10px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">Our solution</p>
        <h2 className="mt-4 text-3xl font-black text-[color:var(--theme-typography-main)]">The five pillars of TANGLAW</h2>
      </div>
      <div className="relative">
        <div
          ref={carouselRef}
          className="hide-scrollbar flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4"
        >
          {PILLARS.map((pillar) => (
            <article
              key={pillar.number}
              className="snap-start min-w-[280px] rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)]/90 p-6 shadow-2xl shadow-black/20"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 text-[color:var(--theme-typography-secondary)] text-sm font-bold">
                {pillar.number}
              </div>
              <h3 className="mt-6 text-xl font-black text-[color:var(--theme-typography-main)]">{pillar.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[color:var(--theme-text-body)]">{pillar.description}</p>
            </article>
          ))}
        </div>

        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-30 h-12 w-12 rounded-full border border-white/15 bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
          aria-label="Scroll carousel left"
        >
          <ChevronLeft className="h-6 w-6 text-[color:var(--theme-typography-main)]" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-30 h-12 w-12 rounded-full border border-white/15 bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
          aria-label="Scroll carousel right"
        >
          <ChevronRight className="h-6 w-6 text-[color:var(--theme-typography-main)]" />
        </button>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-[color:var(--theme-canvas)] py-20 text-[color:var(--theme-text-body)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(122,169,223,0.12),_transparent_18%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.36em] text-[color:var(--theme-typography-secondary)] font-black shadow-lg shadow-black/20">
            <Users className="h-5 w-5" />
            Who Builds TANGLAW
          </div>
          <h1 className="mt-6 font-display text-4xl font-black tracking-[-0.04em] text-[color:var(--theme-typography-main)] sm:text-5xl">
            Redefining scholarship navigation for every learner.
          </h1>
          <p className="mt-6 text-base leading-8 text-[color:var(--theme-text-body)]">
            {TEAM_DESCRIPTION}
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start mb-20">
          <div className="rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)]/90 p-8 shadow-2xl shadow-black/25 backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-[color:var(--theme-typography-secondary)] font-black">
              <BookOpen className="h-4 w-4" /> Our mission
            </div>
            <h2 className="text-3xl font-black text-[color:var(--theme-typography-main)]">A navigation sanctuary for scholarship-ready students.</h2>
            <p className="mt-5 text-sm leading-7 text-[color:var(--theme-text-body)]">
              TANGLAW is designed to simplify grant discovery and preparation through a single dashboard, with clear pathways that help learners move from confusion to confidence.
            </p>
          </div>

          <div className="space-y-4">
            {STATISTICS.map((stat) => (
              <div key={stat.label} className="rounded-[1.8rem] border border-white/10 bg-[color:var(--theme-surface)]/95 p-6 shadow-xl shadow-black/20">
                <p className="text-4xl font-black text-[color:var(--theme-typography-main)]">{stat.label}</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--theme-text-body)]">{stat.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">The Barriers to Brilliance</p>
            <h2 className="mt-4 text-3xl font-black text-[color:var(--theme-typography-main)]">What students face today</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {BARRIERS.map((item) => (
              <article key={item.title} className="rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)]/90 p-6 shadow-2xl shadow-black/20">
                <h3 className="text-xl font-black text-[color:var(--theme-typography-main)]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--theme-text-body)]">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <CarouselSection />

        <section className="rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)]/90 p-8 shadow-2xl shadow-black/25 backdrop-blur-sm">
          <div className="space-y-12">
            <div className="max-w-2xl space-y-4">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">Our creators</p>
              <h2 className="text-3xl font-black text-[color:var(--theme-typography-main)]">Student researchers and builders behind TANGLAW</h2>
              <p className="text-sm leading-7 text-[color:var(--theme-text-body)]">
                This group blends documentation, UX, development, and evaluation expertise to create a scholarship platform that works for Filipino learners.
              </p>
            </div>

            <div className="space-y-10">
              <div>
                <h3 className="text-xl font-black text-[color:var(--theme-typography-main)] mb-6">Documentation Team</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {DOCUMENTATION_TEAM.map((member) => (
                    <div key={member.username} className="rounded-3xl border border-white/10 bg-[color:var(--theme-canvas)]/80 p-5 transition hover:-translate-y-1 hover:bg-[color:var(--theme-canvas)]/95">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--theme-surface)] text-sm font-black text-[color:var(--theme-typography-main)]">
                          {member.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                      </div>
                      <p className="text-sm font-semibold uppercase tracking-[0.27em] text-[color:var(--theme-typography-secondary)]">{member.role}</p>
                      <p className="mt-2 text-base font-black text-[color:var(--theme-typography-main)]">{member.name}</p>
                      <p className="mt-4 text-sm leading-7 text-[color:var(--theme-text-body)]">{member.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-[color:var(--theme-typography-main)] mb-6">Development Team</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {DEVELOPMENT_TEAM.map((member) => (
                    <div key={member.username} className="rounded-3xl border border-white/10 bg-[color:var(--theme-canvas)]/80 p-5 transition hover:-translate-y-1 hover:bg-[color:var(--theme-canvas)]/95">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--theme-surface)] text-sm font-black text-[color:var(--theme-typography-main)]">
                          {member.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                      </div>
                      <p className="text-sm font-semibold uppercase tracking-[0.27em] text-[color:var(--theme-typography-secondary)]">{member.role}</p>
                      <p className="mt-2 text-base font-black text-[color:var(--theme-typography-main)]">{member.name}</p>
                      <p className="mt-4 text-sm leading-7 text-[color:var(--theme-text-body)]">{member.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
