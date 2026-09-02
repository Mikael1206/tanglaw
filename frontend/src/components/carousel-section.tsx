"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Target,
  ClipboardCheck,
  Bot,
  LayoutGrid,
  BarChart3,
} from "lucide-react";
import { GlowingText } from "../../components/ui/glowing-text";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface PillarItem {
  id: number;
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const PILLAR_ITEMS: PillarItem[] = [
  {
    id: 1,
    number: "01",
    title: "Guided Scholarship Matching",
    description:
      "TANGLAW turns raw grant criteria into student-friendly matches and decision prompts.",
    icon: <Target className="h-6 w-6" />,
  },
  {
    id: 2,
    number: "02",
    title: "Adaptive Readiness Check",
    description:
      "Interactive drills help students identify strengths, gaps, and high-impact review areas.",
    icon: <ClipboardCheck className="h-6 w-6" />,
  },
  {
    id: 3,
    number: "03",
    title: "AI Navigation Companion",
    description:
      "Owel answers eligibility questions, simplifies terms, and recommends next steps.",
    icon: <Bot className="h-6 w-6" />,
  },
  {
    id: 4,
    number: "04",
    title: "Smart Scholarship Directory",
    description:
      "Filter grants by institution, funder type, and requirement intensity in one interface.",
    icon: <LayoutGrid className="h-6 w-6" />,
  },
  {
    id: 5,
    number: "05",
    title: "Review Engine & Analytics",
    description:
      "Practice modules and completion metrics keep learners motivated and accountable.",
    icon: <BarChart3 className="h-6 w-6" />,
  },
];

export default function CarouselSection() {
  const [api, setApi] = React.useState<CarouselApi>();

  const count = React.useSyncExternalStore(
    React.useCallback(
      (callback) => {
        if (!api) return () => {};
        api.on("reInit", callback);
        api.on("select", callback);
        return () => {
          api.off("reInit", callback);
          api.off("select", callback);
        };
      },
      [api]
    ),
    () => (api ? api.scrollSnapList().length : 5),
    () => 5
  );

  const current = React.useSyncExternalStore(
    React.useCallback(
      (callback) => {
        if (!api) return () => {};
        api.on("select", callback);
        api.on("reInit", callback);
        return () => {
          api.off("select", callback);
          api.off("reInit", callback);
        };
      },
      [api]
    ),
    () => (api ? api.selectedScrollSnap() + 1 : 1),
    () => 1
  );

  return (
    <section className="mb-24 relative max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.35 }}
        style={{ willChange: "transform, opacity" }}
        className="text-center mb-10"
      >
        <p className="text-[10px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">
          Our solution
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-black text-[color:var(--theme-typography-main)]">
          <GlowingText glowType="primary">The five pillars of TANGLAW</GlowingText>
        </h2>
      </motion.div>

      <div className="relative px-6 sm:px-10 md:px-12">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {PILLAR_ITEMS.map((pillar, index) => (
              <CarouselItem
                key={pillar.id}
                className="pl-3 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1 h-full">
                  <Card className="h-full border border-white/10 bg-[color:var(--theme-surface)]/85 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1">
                    <CardContent className="flex flex-col justify-between p-6 sm:p-8 h-full min-h-[320px]">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-4xl sm:text-5xl font-black tracking-tight text-[color:var(--theme-typography-main)] opacity-90">
                            {pillar.number}
                          </span>
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm transition-transform duration-300 hover:scale-110">
                            {pillar.icon}
                          </div>
                        </div>
                        <h3 className="mt-6 text-xl font-black text-[color:var(--theme-typography-main)] tracking-tight">
                          {pillar.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-[color:var(--theme-text-body)]">
                          {pillar.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[color:var(--theme-typography-secondary)]">
                        <span>Pillar {index + 1} of 5</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {/* Indicators & Slide Counter */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            {Array.from({ length: count || 5 }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === current - 1
                    ? "h-2 w-8 bg-primary shadow-sm"
                    : "h-2 w-2 bg-[color:var(--theme-borders-system)]/30 hover:bg-[color:var(--theme-borders-system)]/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <div className="text-xs font-semibold tracking-wider uppercase text-[color:var(--theme-typography-secondary)]">
            Slide {current} of {count}
          </div>
        </div>
      </div>
    </section>
  );
}
