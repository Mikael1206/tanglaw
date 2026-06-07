"use client";

/**
 * About page describing the project goals and team members.
 */
import Image from "next/image";
import { Users, BookOpen, Linkedin, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/scroll-reveal";
import { EtheralShadow } from "../../../components/ui/etheral-shadow";
import { GlowingText } from "../../../components/ui/glowing-text";

const TEAM_DESCRIPTION = "A student-led research initiative that blends academic insight with scholarship navigation. We built TANGLAW to make grants easier to find, understand, and act on.";

const DOCUMENTATION_TEAM = [
  {
    name: "Godsent John C. Salvaloza",
    role: "Documentation Head",
    description: "Oversees all paper sections, references indexation, and final compiled academic paper validation.",
    username: "salvaloza",
    linkedin: "https://www.linkedin.com/in/pfajami7ifbnwgzt/",
  },
  {
    name: "Rhaine Venice B. Bonador",
    role: "Introduction Writer",
    description: "Handles Chapter 1 problem contexts, general socioeconomic gaps, and solution frameworks.",
    username: "bonador",
    linkedin: "https://www.linkedin.com/in/tanglaw-bonador",
  },
  {
    name: "Kyle Ashley B. Madera",
    role: "Statement of the Problem Writer",
    description: "Transforms operational goals into measurable research questions, metrics, and study definitions.",
    username: "madera",
    linkedin: "https://www.linkedin.com/in/kyle-ashley-madera-5ba136374/",
  },
  {
    name: "Hannah Mae V. Alberto",
    role: "RRL Lead Writer",
    description: "Manages literature review synthesis, source curation, and academic narrative alignment.",
    username: "alberto",
    linkedin: "https://www.linkedin.com/in/tanglaw-alberto",
  },
  {
    name: "Hannah Nicole B. Partible",
    role: "RRL Assistant & Citation Checker",
    description: "Maintains reference accuracy, citation formatting, and academic consistency.",
    username: "partible",
    linkedin: "https://www.linkedin.com/in/hannah-nicole-partible-405b093b0/",
  },
  {
    name: "Emerald T. Perez",
    role: "Methodology Writer",
    description: "Structures the research design, evaluation method, and analytical process.",
    username: "perez",
    linkedin: "https://www.linkedin.com/in/tanglaw-perez",
  },
  {
    name: "Julliane Mae G. Araullo",
    role: "Results Writer",
    description: "Compiles findings, performance metrics, and usability impact narratives.",
    username: "araullo",
    linkedin: "https://www.linkedin.com/in/julliane-mae-araullo-0a7167386/",
  },
  {
    name: "Daniel F. Pajares",
    role: "Discussion Writer",
    description: "Explains implications, limitations, and future recommendations of the project.",
    username: "pajares",
    linkedin: "https://www.linkedin.com/in/tanglaw-pajares",
  },
];

const DEVELOPMENT_TEAM = [
  {
    name: "Bennett P. Payoyo",
    role: "Project Manager",
    description: "Directs operational scope, research alignment, task delegation, and final deployment quality gates.",
    username: "payoyo",
    linkedin: "https://www.linkedin.com/in/bennett-payoyo-a942a0379/",
  },
  {
    name: "An-joe Mikael T. Albano",
    role: "Frontend Developer",
    description: "Leads interface delivery, motion polish, and responsive behavior.",
    username: "albano",
    linkedin: "https://www.linkedin.com/in/an-joe-mikael-albano-2aa598365/",
  },
  {
    name: "Levrone Viel S. Delos Reyes",
    role: "Frontend & QA",
    description: "Supports UI quality checks, interaction validation, and accessibility review.",
    username: "delosreyes",
    linkedin: "https://www.linkedin.com/in/tanglaw-delosreyes",
  },
  {
    name: "Charles Joseph V. Faustino",
    role: "Backend Developer & Database Manager",
    description: "Builds server interactions, data flow structure, and simulated persistence pathways.",
    username: "faustino",
    linkedin: "https://www.linkedin.com/in/charles286/",
  },
  {
    name: "Justin Angelo G. Cruz",
    role: "QA Tester / Technical Documentation",
    description: "Manages test matrices, documentation clarity, and final feature verification.",
    username: "cruz",
    linkedin: "https://www.linkedin.com/in/justin-angelo-cruz-315bab2ba/",
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

// Map of usernames to their 2.0 photo filenames (mixed .jpg/.png)
const PHOTO_2_0: Record<string, string> = {
  salvaloza: "salvaloza2.0.png",
  bonador: "bonador2.0.jpg",
  madera: "madera2.0.png",
  alberto: "alberto2.0.jpg",
  partible: "partible2.0.jpg",
  perez: "perez2.0.png",
  araullo: "araullo2.0.png",
  pajares: "pajares2.0.jpg",
  payoyo: "payoyo2.0.jpg",
  delosreyes: "delosreyes2.0.jpg",
  faustino: "faustino2.0.png",
  cruz: "cruz2.0.png",
  albano: "albano2.0.jpg",
};

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
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseUntilRef = useRef(0);
  const isProgrammaticScroll = useRef(false);

  const getCardWidth = useCallback(() => {
    if (!carouselRef.current?.children[0]) return 364;
    return (carouselRef.current.children[0] as HTMLElement).offsetWidth + 24;
  }, []);

  const scrollTo = useCallback((index: number) => {
    if (!carouselRef.current) return;
    isProgrammaticScroll.current = true;
    const cardWidth = getCardWidth();
    carouselRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, [getCardWidth]);

  const nextSlide = useCallback(() => {
    const next = (activeIndexRef.current + 1) % PILLARS.length;
    scrollTo(next);
  }, [scrollTo]);

  const prevSlide = useCallback(() => {
    const prev = (activeIndexRef.current - 1 + PILLARS.length) % PILLARS.length;
    scrollTo(prev);
  }, [scrollTo]);

  // Sync activeIndex on manual scroll
  const handleScroll = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft } = carouselRef.current;
    const cardWidth = getCardWidth();
    if (cardWidth <= 0) return;
    const idx = Math.round(scrollLeft / cardWidth);
    if (idx !== activeIndexRef.current && idx >= 0 && idx < PILLARS.length) {
      activeIndexRef.current = idx;
      setActiveIndex(idx);
    }
  }, [getCardWidth]);

  // Pause auto-play briefly on any user interaction
  const pauseAutoPlay = useCallback(() => {
    pauseUntilRef.current = Date.now() + 8000;
  }, []);

  // Auto-play interval: advances every 4s unless paused
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      if (Date.now() >= pauseUntilRef.current) {
        nextSlide();
      }
    }, 4000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [nextSlide]);

  // Scroll listener for dot syncing and pausing auto-play
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => {
      handleScroll();
      // Only pause auto-play for user-initiated scrolls (drag/wheel/touch),
      // not for programmatic scrolls from auto-play itself.
      if (!isProgrammaticScroll.current) {
        pauseAutoPlay();
      }
      isProgrammaticScroll.current = false;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [handleScroll, pauseAutoPlay]);

  return (
    <section className="mb-24 relative">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <p className="text-[10px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">Our solution</p>
        <h2 className="mt-4 text-3xl font-black text-[color:var(--theme-typography-main)]"><GlowingText glowType="primary">The five pillars of TANGLAW</GlowingText></h2>
      </motion.div>

      <div className="relative">
        {/* Slider Track */}
        <div
          ref={carouselRef}
          role="list"
          aria-label="The five pillars of TANGLAW"
          className="hide-scrollbar flex gap-6 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth py-4"
          style={{ overscrollBehaviorX: "contain" }}
        >
          {PILLARS.map((pillar, index) => (
            <motion.article
              key={pillar.number}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { pauseAutoPlay(); scrollTo(index); }}}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.08 * index,
              }}
              className="
                snap-start shrink-0 grow-0 basis-[340px]
                min-h-[470px]
                rounded-[1.5rem]
                border border-white/10
                bg-[color:var(--theme-surface)]/90
                px-8 py-10
                shadow-2xl shadow-black/20
                transition-all duration-300
                cursor-pointer
                flex flex-col
                hover:-translate-y-1 hover:border-white/20
              "
              onClick={() => { pauseAutoPlay(); scrollTo(index); }}
            >
              {/* Large numeric indicator */}
              <span className="font-display text-5xl sm:text-6xl font-black text-[color:var(--theme-accent-periwinkle)] leading-none tracking-tight">
                {pillar.number}
              </span>

              {/* Divider spacer */}
              <div className="mt-6 w-10 h-[2px] rounded-full bg-[color:var(--theme-borders-system)]/40" />

              {/* Title */}
              <h3 className="mt-6 text-2xl font-black text-[color:var(--theme-typography-main)] leading-snug">
                {pillar.title}
              </h3>

              {/* Body text */}
              <p className="mt-4 text-base leading-relaxed text-[color:var(--theme-text-body)] flex-1">
                {pillar.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Bottom Controls — centered arrow buttons */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          onClick={() => { pauseAutoPlay(); prevSlide(); }}
          className="
            h-12 w-12 rounded-full
            border border-white/15
            bg-[color:var(--theme-surface)]/80 backdrop-blur-md
            flex items-center justify-center
            hover:bg-[color:var(--theme-surface)]
            active:scale-95
            transition-all duration-200
            shadow-xl shadow-black/30
          "
          aria-label="Previous pillar"
        >
          <ChevronLeft className="h-5 w-5 text-[color:var(--theme-typography-main)]" />
        </button>

        {/* Pill indicator dots */}
        <div className="flex items-center gap-2 px-4">
          {PILLARS.map((pillar, index) => (
            <button
              key={pillar.number}
              onClick={() => { pauseAutoPlay(); scrollTo(index); }}
              aria-label={`Go to pillar ${pillar.number}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={`
                h-2 rounded-full transition-all duration-300
                ${index === activeIndex
                  ? "w-8 bg-[color:var(--theme-typography-main)]"
                  : "w-2 bg-[color:var(--theme-borders-system)]/40 hover:bg-[color:var(--theme-borders-system)]/60"
                }
              `}
            />
          ))}
        </div>

        <button
          onClick={() => { pauseAutoPlay(); nextSlide(); }}
          className="
            h-12 w-12 rounded-full
            border border-white/15
            bg-[color:var(--theme-surface)]/80 backdrop-blur-md
            flex items-center justify-center
            hover:bg-[color:var(--theme-surface)]
            active:scale-95
            transition-all duration-200
            shadow-xl shadow-black/30
          "
          aria-label="Next pillar"
        >
          <ChevronRight className="h-5 w-5 text-[color:var(--theme-typography-main)]" />
        </button>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-[color:var(--theme-canvas)] py-20 text-[color:var(--theme-text-body)]">
      <EtheralShadow
        animation={{ scale: 60, speed: 80 }}
        noise={{ opacity: 0.8, scale: 1.0 }}
        sizing="cover"
        lightColor="rgba(200, 230, 175, 0.85)"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(122,169,223,0.12),_transparent_18%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <header className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.36em] text-[color:var(--theme-typography-secondary)] font-black shadow-lg shadow-black/20">
              <Users className="h-5 w-5" />
              Who Builds TANGLAW
            </div>
            <h1 className="mt-6 font-display text-4xl font-black tracking-[-0.04em] text-[color:var(--theme-typography-main)] sm:text-5xl">
              <GlowingText glowType="primary">Redefining scholarship navigation for every learner.</GlowingText>
            </h1>
            <p className="mt-6 text-base leading-8 text-[color:var(--theme-text-body)]">
              {TEAM_DESCRIPTION}
            </p>
          </header>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start mb-20">
            <div className="rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)]/90 p-8 shadow-2xl shadow-black/25 backdrop-blur-sm">
              <div className="mb-6 flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-[color:var(--theme-typography-secondary)] font-black">
                <BookOpen className="h-4 w-4" /> Our mission
              </div>
              <h2 className="text-3xl font-black text-[color:var(--theme-typography-main)]">
                <GlowingText glowType="primary">A navigation sanctuary for scholarship-ready students.</GlowingText>
              </h2>
              <p className="mt-5 text-sm leading-7 text-[color:var(--theme-text-body)]">
                <GlowingText glowType="primary">TANGLAW is designed to simplify grant discovery and preparation through a single dashboard, with clear pathways that help learners move from confusion to confidence.</GlowingText>
              </p>
            </div>

            <div className="space-y-4">
              {STATISTICS.map((stat, idx) => (
                <ScrollReveal key={stat.label} delay={0.15 * idx} direction="right">
                  <div className="rounded-[1.8rem] border border-white/10 bg-[color:var(--theme-surface)]/95 p-6 shadow-xl shadow-black/20">
                    <p className="text-4xl font-black text-[color:var(--theme-typography-main)]">{stat.label}</p>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--theme-text-body)]">{stat.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <section className="mb-20">
            <div className="text-center mb-10">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">The Barriers to Brilliance</p>
              <h2 className="mt-4 text-3xl font-black text-[color:var(--theme-typography-main)]">What students face today</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {BARRIERS.map((item, idx) => (
                <ScrollReveal key={item.title} delay={0.1 * idx} direction="up">
                  <article className="rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)]/90 p-6 shadow-2xl shadow-black/20 h-full">
                    <h3 className="text-xl font-black text-[color:var(--theme-typography-main)]">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[color:var(--theme-text-body)]">{item.description}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <CarouselSection />

        <ScrollReveal direction="up">
          <section className="rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)]/90 p-8 shadow-2xl shadow-black/25 backdrop-blur-sm">
            <div className="space-y-12">
              <div className="mx-auto text-center max-w-2xl space-y-4">
                <p className="text-[10px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">Our creators</p>
                <h2 className="text-3xl font-black text-[color:var(--theme-typography-main)]"><GlowingText glowType="primary">Student researchers and builders behind TANGLAW</GlowingText></h2>
                <p className="text-sm leading-7 text-[color:var(--theme-text-body)]">
                  This group blends documentation, UX, development, and evaluation expertise to create a scholarship platform that works for Filipino learners.
                </p>
              </div>

              <div className="space-y-10">
                <div>
                  <h3 className="text-xl font-black text-[color:var(--theme-typography-main)] mb-6 text-center">Documentation Team</h3>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {DOCUMENTATION_TEAM.map((member, idx) => (
                      <ScrollReveal key={member.username} delay={0.05 * idx} direction="up">
                        <div className="group flex flex-col items-center text-center h-full rounded-3xl border border-white/10 bg-[color:var(--theme-canvas)]/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-[color:var(--theme-canvas)]/95 shadow-md">
                          <div className="relative h-24 w-24 mb-4 rounded-full overflow-hidden border-2 border-primary/40 bg-[color:var(--theme-surface)] shadow-inner">
                            <Image
                              src={`/team/${PHOTO_2_0[member.username] ?? `${member.username}.jpg`}`}
                              alt={member.name}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                            {/* LinkedIn overlay — fades in on card hover or keyboard focus */}
                            <div className="
                              absolute inset-0 rounded-full
                              flex items-center justify-center
                              bg-black/50 backdrop-blur-[1px]
                              opacity-0 group-hover:opacity-100
                              group-focus-within:opacity-100
                              pointer-events-none group-hover:pointer-events-auto
                              group-focus-within:pointer-events-auto
                              transition-all duration-300 ease-in-out
                            ">
                              <a
                                href={member.linkedin || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-10 w-10 rounded-full bg-white/20 hover:bg-white/40 focus-visible:bg-white/40 transition-colors"
                                aria-label={`${member.name} on LinkedIn`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Linkedin className="h-5 w-5 text-white" />
                              </a>
                            </div>
                          </div>
                          <p className="text-xs font-semibold uppercase tracking-[0.27em] text-[color:var(--theme-typography-secondary)]">{member.role}</p>
                          <p className="mt-2 text-base font-black text-[color:var(--theme-typography-main)] leading-tight">{member.name}</p>
                          <p className="mt-4 text-xs leading-relaxed text-[color:var(--theme-text-body)] opacity-90">{member.description}</p>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-[color:var(--theme-typography-main)] mb-6 text-center">Development Team</h3>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {DEVELOPMENT_TEAM.map((member, idx) => (
                      <ScrollReveal key={member.username} delay={0.05 * idx} direction="up">
                        <div className="group flex flex-col items-center text-center h-full rounded-3xl border border-white/10 bg-[color:var(--theme-canvas)]/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-[color:var(--theme-canvas)]/95 shadow-md">
                          <div className="relative h-24 w-24 mb-4 rounded-full overflow-hidden border-2 border-primary/40 bg-[color:var(--theme-surface)] shadow-inner">
                            <Image
                              src={`/team/${PHOTO_2_0[member.username] ?? `${member.username}.jpg`}`}
                              alt={member.name}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                            {/* LinkedIn overlay — fades in on card hover or keyboard focus */}
                            <div className="
                              absolute inset-0 rounded-full
                              flex items-center justify-center
                              bg-black/50 backdrop-blur-[1px]
                              opacity-0 group-hover:opacity-100
                              group-focus-within:opacity-100
                              pointer-events-none group-hover:pointer-events-auto
                              group-focus-within:pointer-events-auto
                              transition-all duration-300 ease-in-out
                            ">
                              <a
                                href={member.linkedin || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-10 w-10 rounded-full bg-white/20 hover:bg-white/40 focus-visible:bg-white/40 transition-colors"
                                aria-label={`${member.name} on LinkedIn`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Linkedin className="h-5 w-5 text-white" />
                              </a>
                            </div>
                          </div>
                          <p className="text-xs font-semibold uppercase tracking-[0.27em] text-[color:var(--theme-typography-secondary)]">{member.role}</p>
                          <p className="mt-2 text-base font-black text-[color:var(--theme-typography-main)] leading-tight">{member.name}</p>
                          <p className="mt-4 text-xs leading-relaxed text-[color:var(--theme-text-body)] opacity-90">{member.description}</p>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
