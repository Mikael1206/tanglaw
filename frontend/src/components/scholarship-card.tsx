"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, GraduationCap, Filter, BookOpen, FileText, HelpCircle, Calendar } from "lucide-react";
import type { ScholarshipOpportunity } from "@/data/scholarships-data";

interface ScholarshipCardProps {
  scholarship: ScholarshipOpportunity;
  isExpanded: boolean;
  onToggle: (name: string) => void;
}

const ELIGIBILITY_LABELS: Record<string, string> = {
  exclusivity: "Exclusivity",
  residency: "Residency",
  financialStatus: "Financial Status",
  minimumGPA: "Minimum GPA",
};

const ScholarshipCard = React.memo(function ScholarshipCard({
  scholarship,
  isExpanded,
  onToggle,
}: ScholarshipCardProps) {
  const s = scholarship;
  const isPrivate = s.classification.toLowerCase().includes("private");
  const nameSlug = s.name.replace(/\s+/g, "-");

  return (
    <article
      className="bg-[color:var(--theme-surface)]/80 border-2 border-accent-muted/40 rounded-[2rem] p-4 sm:p-6 flex flex-col transition-all duration-200 group hover:shadow-xl hover:border-accent-muted hover:-translate-y-1"
    >
      {/* ── Always Visible Section ── */}
      <div className="space-y-4">
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${
            !isPrivate
              ? "bg-accent-periwinkle/65 border-accent-muted text-text-primary"
              : "bg-primary/10 border-primary/20 text-primary dark:text-text-primary"
          }`}>
            {s.classification}
          </span>
          <span className="text-[10px] bg-[color:var(--theme-canvas)] border border-accent-periwinkle/80 text-[color:var(--theme-text-body)] font-black px-2.5 py-0.5 rounded-full">
            {s.strand}
          </span>
        </div>

        {/* Name and Sponsor */}
        <div>
          <h3 className="font-black text-base sm:text-lg text-text-primary leading-tight group-hover:text-[color:var(--theme-typography-main)] mb-1 break-words">
            {s.name}
          </h3>
          <p className="text-xs text-[color:var(--theme-text-body)] opacity-70">
            Provider: <span className="text-text-primary font-bold">{s.provider}</span>
          </p>
        </div>

        {/* Overview */}
        <p className="text-xs text-[color:var(--theme-text-body)] leading-relaxed opacity-90 italic">
          {s.overview}
        </p>
      </div>

      {/* ── Toggle Trigger ── */}
      <button
        onClick={() => onToggle(s.name)}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-accent-muted/30 bg-[color:var(--theme-canvas)]/50 text-xs font-bold text-text-primary hover:bg-[color:var(--theme-canvas)] hover:border-accent-muted/60 transition-all duration-200 cursor-pointer group/toggle"
        aria-expanded={isExpanded}
        aria-controls={`card-body-${nameSlug}`}
      >
        <span className="transition-opacity duration-200">
          {isExpanded ? "Hide Details" : "View Full Details"}
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      {/* ── Collapsible Body ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="card-body"
            id={`card-body-${nameSlug}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-5 space-y-5">
              {/* Benefits Block */}
              <div className="rounded-2xl bg-base-pastel/40 p-4 border border-accent-periwinkle/30">
                <h4 className="text-xs font-black text-text-primary uppercase tracking-wide flex items-center gap-1.5 mb-2">
                  <GraduationCap className="h-4 w-4" /> Benefits & Coverage
                </h4>
                <p className="text-xs text-[color:var(--theme-text-body)] font-bold">{s.coverageType}</p>
                <p className="text-xs text-[color:var(--theme-text-body)] mt-1">{s.coverageDetails}</p>
              </div>

              {/* Eligibility List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-text-primary uppercase tracking-wide flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5" /> Eligibility Criteria
                </h4>
                <ul className="text-xs text-[color:var(--theme-text-body)] space-y-1 pl-4 list-disc">
                  {Object.entries(s.eligibility).map(([key, value]) => {
                    if (!value) return null;
                    const label = ELIGIBILITY_LABELS[key] ?? key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());
                    return (
                      <li key={key}>
                        <span className="font-semibold text-text-primary">{label}:</span> {value}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Priority Programs badges */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-text-primary uppercase tracking-wide flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> Priority Programs
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {s.priorityPrograms.map((p, i) => (
                    <span key={i} className="text-[10px] bg-[color:var(--theme-base-pastel)] border border-accent-periwinkle/40 text-text-primary px-2 py-0.5 rounded-lg font-semibold">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Requirements Block */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-text-primary uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Requirements Checklist
                </h4>
                <ol className="text-xs text-[color:var(--theme-text-body)] space-y-1.5 pl-5 list-decimal marker:text-text-primary marker:font-semibold">
                  {s.requirements.map((r, i) => (
                    <li key={i} className="pl-1">{r}</li>
                  ))}
                </ol>
              </div>

              {/* Exam & Deadline info */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-accent-muted/20 text-xs">
                <div>
                  <p className="font-bold text-text-primary flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5" /> Evaluation
                  </p>
                  <p className="mt-1 text-[color:var(--theme-text-body)] opacity-95">{s.examInformation.type}</p>
                </div>
                <div>
                  <p className="font-bold text-text-primary flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Deadline
                  </p>
                  <p className="mt-1 text-[color:var(--theme-text-body)] opacity-95 font-semibold text-rose-600">{s.deadline}</p>
                </div>
              </div>

              {/* Apply Actions */}
              <div className="w-full pt-2">
                <a
                  href={s.links[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-full text-xs font-black border border-accent-muted shadow-sm shadow-[var(--theme-glow-primary)] hover:bg-primary-hover transition-all duration-300 focus:outline-none cursor-pointer text-center"
                >
                  Apply Directly <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
});

export default ScholarshipCard;
