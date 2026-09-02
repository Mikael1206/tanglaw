"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, CheckCircle2, AlertTriangle, BookMarked, RotateCcw } from "lucide-react";

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Filipino",
  "Logical Reasoning"
] as const;

type SubjectType = typeof SUBJECTS[number];

interface ReadinessFeedbackProps {
  score: number;
  total: number;
  scorePercentage: number;
  subjectScores: Record<SubjectType, { correct: number; total: number; answered: number }>;
  readinessDetails: { level: string; color: string; icon: React.ReactNode; text: string };
  studyRecommendations: string[];
  onRestart: () => void;
}

const ReadinessFeedback = React.memo(function ReadinessFeedback({
  score,
  total,
  scorePercentage,
  subjectScores,
  readinessDetails,
  studyRecommendations,
  onRestart,
}: ReadinessFeedbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="rounded-[2rem] border border-accent-muted/40 bg-[color:var(--theme-surface)] shadow-2xl overflow-hidden">
        {/* Score summary header banner */}
        <div className="bg-[color:var(--theme-canvas)] p-8 text-center border-b border-accent-periwinkle">
          <div className="inline-flex p-4 bg-[color:var(--theme-surface)] rounded-full shadow-md border-2 border-accent-periwinkle mb-4">
            <Award className="h-12 w-12 text-primary-hover animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-text-primary tracking-tight">Readiness Check Analysis</h2>
          <p className="text-xs text-[color:var(--theme-text-muted)] font-black uppercase tracking-widest mt-1">
            TANGLAW Scholarship Competency Analyzer
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center p-6 bg-base-light/35 border border-accent-periwinkle rounded-[2rem]">
              <span className="text-xs font-bold text-[color:var(--theme-text-muted)] block uppercase mb-1">Cumulative Score</span>
              <span className="text-4xl font-black text-text-primary">
                {score} <span className="text-lg text-[color:var(--theme-text-muted)] font-normal">/ {total}</span>
              </span>
              <span className="block text-xs text-[color:var(--theme-text-body)] font-semibold mt-1">
                ({scorePercentage}% accuracy)
              </span>
            </div>

            <div className="md:col-span-2 p-6 rounded-[2rem] border-2 flex gap-4 items-start bg-[color:var(--theme-canvas)] border-accent-periwinkle">
              <div className="mt-1 flex-shrink-0">
                {readinessDetails.icon}
              </div>
              <div>
                <h4 className="font-black text-sm text-text-primary">
                  Readiness Summary: <span className="underline decoration-accent-muted underline-offset-2">{readinessDetails.level}</span>
                </h4>
                <p className="text-xs text-[color:var(--theme-text-body)] mt-2 leading-relaxed">
                  {readinessDetails.text}
                </p>
              </div>
            </div>
          </div>

          {/* Score breakdown per subject with horizontal progress bars */}
          <div className="rounded-[2rem] border border-accent-muted/30 p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">Subject-by-Subject Breakdown</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(subjectScores).map(([subj, stats]) => {
                if (stats.total === 0) return null;
                const accuracy = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;
                
                return (
                  <div key={subj} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-text-primary">
                      <span>{subj}</span>
                      <span>{stats.correct} / {stats.total} ({accuracy}%)</span>
                    </div>
                    <div className="h-2.5 bg-base-pastel rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${accuracy}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tailored Study Recommendations based on scores */}
          <div className="bg-[color:var(--theme-canvas)]/50 border border-accent-periwinkle rounded-[2rem] p-6">
            <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-1.5">
              <BookMarked className="h-4 w-4 text-primary" /> Recommended Study Areas:
            </h3>
            <ul className="text-xs text-[color:var(--theme-text-body)] space-y-2">
              {studyRecommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent-rose mt-1 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reattempt config reset button */}
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3.5 rounded-full font-black border-2 border-accent-muted shadow-md cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <RotateCcw className="h-4 w-4" /> Start New Assessment Check
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default ReadinessFeedback;
