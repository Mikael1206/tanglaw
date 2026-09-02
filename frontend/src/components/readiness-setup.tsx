"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, Check, BookOpen, ArrowRight, Loader2 } from "lucide-react";

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Filipino",
  "Logical Reasoning"
] as const;

type SubjectType = typeof SUBJECTS[number];

const DIFFICULTY_LEVELS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: "Lvl 1 · Easiest" },
  { value: 2, label: "Lvl 2 · Easy" },
  { value: 3, label: "Lvl 3 · Moderate" },
  { value: 4, label: "Lvl 4 · Hard" },
  { value: 5, label: "Lvl 5 · Advanced" },
];

const ITEM_COUNT_OPTIONS = [10, 20, 30, 40, 50] as const;

interface ReadinessSetupProps {
  selectedSubjects: SubjectType[];
  onSubjectChange: (subject: SubjectType) => void;
  itemCount: 10 | 20 | 30 | 40 | 50;
  onItemCountChange: (count: 10 | 20 | 30 | 40 | 50) => void;
  selectedDifficulty: 1 | 2 | 3 | 4 | 5;
  onDifficultyChange: (diff: 1 | 2 | 3 | 4 | 5) => void;
  isLoading: boolean;
  loadError: string | null;
  onStartDiagnostics: () => void;
  onStartMockExam: () => void;
}

export default function ReadinessSetup({
  selectedSubjects,
  onSubjectChange,
  itemCount,
  onItemCountChange,
  selectedDifficulty,
  onDifficultyChange,
  isLoading,
  loadError,
  onStartDiagnostics,
  onStartMockExam,
}: ReadinessSetupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full max-w-full"
    >
      {/* Option 1: Gamified Quick Diagnostics — staggered reveal */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.3, ease: [0.21, 1.02, 0.43, 1.01], delay: 0.05 }}
        className="lg:col-span-8 space-y-5 lg:space-y-6"
      >
        <div className="rounded-[2rem] border border-accent-muted/40 bg-[color:var(--theme-surface)] p-5 sm:p-6 lg:p-8 shadow-xl">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight break-words">Option 1: Gamified Quick Diagnostics</h2>
            <p className="text-xs sm:text-sm text-[color:var(--theme-text-body)] mt-2 leading-relaxed">
              Configure a customizable timed evaluation to analyze specific subjects and map strengths quickly.
            </p>
          </div>

          <div className="space-y-6">
            {/* Subject Checkboxes with touch targets */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-text-primary block">
                Select Assessment Subjects:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                {SUBJECTS.map((subj) => {
                  const isChecked = selectedSubjects.includes(subj);
                  return (                      <button
                      key={subj}
                      type="button"
                      onClick={() => onSubjectChange(subj)}
                      className={`p-4 sm:p-4 rounded-xl border text-sm sm:text-xs font-bold transition-all duration-300 cursor-pointer text-left flex items-center justify-between gap-2 sm:gap-3 min-h-[48px] ${
                        isChecked
                          ? "bg-primary border-primary-hover text-white shadow-sm shadow-[var(--theme-glow-primary)]"
                          : "bg-[color:var(--theme-canvas)] border-accent-periwinkle/60 text-[color:var(--theme-text-muted)] hover:border-accent-periwinkle"
                      }`}
                    >
                      <span className="break-words text-balance">{subj}</span>
                      {isChecked && <Check className="h-4 w-4 text-white flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Volume — Range Slider */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-text-primary block">
                Select Question Volume:
              </label>
              <div className="rounded-xl border border-accent-periwinkle/40 bg-[color:var(--theme-canvas)] px-4 py-5 space-y-4">
                {/* Value indicator */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[color:var(--theme-text-muted)] font-semibold">Items</span>
                  <span className="bg-primary text-white px-3 py-1 rounded-full font-black text-xs">
                    Selected: {itemCount} Items
                  </span>
                </div>
                {/* Slider */}
                <div className="relative">
                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={10}
                    value={itemCount}
                    onChange={(e) => onItemCountChange(Number(e.target.value) as 10 | 20 | 30 | 40 | 50)}
                    className="readiness-slider w-full h-2 rounded-full appearance-none cursor-pointer bg-[color:var(--theme-borders-system)]/25 accent-[color:var(--theme-primary)]"
                  />
                  {/* Tick marks */}
                  <div className="flex justify-between px-0.5 mt-2">
                    {ITEM_COUNT_OPTIONS.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => onItemCountChange(val)}
                        className={`text-xs font-bold transition-colors cursor-pointer px-2 py-1 min-h-[36px] ${
                          itemCount === val
                            ? "text-[color:var(--theme-primary)]"
                            : "text-[color:var(--theme-text-muted)] hover:text-[color:var(--theme-primary)]"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Difficulty scaling */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-text-primary block">
                Select Difficulty Level:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-3">
                {DIFFICULTY_LEVELS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onDifficultyChange(value)}
                    className={`p-4 sm:p-4 rounded-xl border text-sm sm:text-xs font-black transition-all cursor-pointer text-center min-h-[48px] ${
                      selectedDifficulty === value
                        ? "bg-primary border-primary-hover text-white shadow-sm"
                        : "bg-[color:var(--theme-canvas)] border-accent-periwinkle/60 text-[color:var(--theme-text-muted)] hover:border-accent-periwinkle"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Load error */}
            {loadError && (
              <div className="rounded-xl border border-accent-rose bg-accent-rose/20 px-4 py-3 text-xs font-semibold text-[color:var(--theme-text-body)]">
                {loadError}
              </div>
            )}

            {/* Launch button */}
            <button
              onClick={onStartDiagnostics}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-4 sm:py-4 rounded-full font-black border-2 border-accent-muted shadow-md shadow-[var(--theme-glow-primary)] cursor-pointer transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[52px]"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
              {isLoading ? "Loading Questions..." : "Start Diagnostics Check"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Option 2: Comprehensive Mock Exam — staggered reveal */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.3, ease: [0.21, 1.02, 0.43, 1.01], delay: 0.1 }}
        className="lg:col-span-4"
      >
        <div className="rounded-[2rem] border-2 border-primary/20 bg-primary/5 p-5 sm:p-6 lg:p-8 shadow-xl flex flex-col justify-between space-y-6 sm:space-y-8 h-auto lg:h-full">
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-primary text-white shadow-lg">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black text-primary">Option 2: Comprehensive Mock Exam</h3>
            <p className="text-xs leading-relaxed text-[color:var(--theme-text-body)]">
              Simulate real-world examination environments under timed conditions. Challenges a standard board assessment block.
            </p>
            <ul className="space-y-2 text-xs text-[color:var(--theme-text-body)] pl-4 list-disc opacity-90">
              <li>Fixed 250 items total</li>
              <li>Exactly 50 items per subject</li>
              <li>3 Hours countdown timer</li>
              <li>Subject matrix sidebar navigation</li>
              <li>Full diagnostic review breakdown</li>
            </ul>
          </div>

          <button
            onClick={onStartMockExam}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-4 sm:py-4 rounded-full font-black border-2 border-accent-muted shadow-lg shadow-[var(--theme-glow-primary)] cursor-pointer transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[52px]"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {isLoading ? "Loading..." : "Launch Full Mock Exam"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { SUBJECTS };
export type { SubjectType };
