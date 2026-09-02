"use client";

/**
 * Technical 'Mission Briefing' unit for the onboarding flow.
 * Owel provides dynamic impact reports based on the current step.
 */
import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface OwelBriefingProps {
  step: number;
  report: string;
}

const IMPACT_REPORTS = [
  "UNIT_ID: Initializing student profile. Scanning for existing records.",
  "TRAJECTORY: Mapping academic pathways. 120+ specialized grants detected.",
  "FINANCIAL: Calibrating income tiers. Analyzing 42 matching financial grants.",
  "COORDINATES: Verifying regional eligibility. Locating LGU assistance units.",
];

export default function OwelBriefing({ step, report }: OwelBriefingProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border-technical bg-[color:var(--theme-surface)] p-8 shadow-2xl relative overflow-hidden group rounded-xl"
    >
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary rounded-tr-lg" />
      
      <div className="flex items-start gap-6 relative z-10">
        <motion.div 
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          className="h-16 w-16 border-technical bg-white flex items-center justify-center shrink-0 relative rounded-md overflow-hidden"
        >
          <div className="absolute -top-1 -left-1 h-2 w-2 border-t border-l border-primary opacity-50 rounded-tl-sm" />
          <Image
            src="/assets/owel-head.webp"
            alt="Owel Alpha Unit"
            width={48}
            height={48}
            className="object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-300"
          />
        </motion.div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Unit: Owel-Alpha</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          
          <div className="min-h-[60px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10, filter: "blur(2px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -10, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-2"
              >
                <p className="text-[10px] font-mono text-[color:var(--theme-text-muted)] uppercase leading-tight font-black tracking-widest">
                  [{IMPACT_REPORTS[step - 1]}]
                </p>
                <p className="text-sm font-bold uppercase tracking-wide text-[color:var(--theme-typography-main)] leading-relaxed">
                  {report}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-50 group-hover:opacity-80 transition-opacity">
        <div className="h-px w-8 bg-primary" />
        <span className="text-[8px] font-mono uppercase font-black tracking-[0.2em]">Status: Briefing</span>
      </div>
    </motion.div>
  );
}
