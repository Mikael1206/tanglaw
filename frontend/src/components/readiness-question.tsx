"use client";

import React from "react";
import { Timer } from "lucide-react";

interface Question {
  id: number;
  subject: "Mathematics" | "Science" | "English" | "Filipino" | "Logical Reasoning";
  difficulty: number;
  questionText: string;
  options: string[];
  correctAnswer: number;
}

interface ReadinessQuestionProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | undefined;
  onSelectOption: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  timeLeft: number;
  canGoNext: boolean;
  canGoPrev: boolean;
}

const ReadinessQuestion = React.memo(function ReadinessQuestion({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onSelectOption,
  onNext,
  onPrev,
  timeLeft,
  canGoNext,
  canGoPrev,
}: ReadinessQuestionProps) {
  return (
    <div className="max-w-3xl mx-auto rounded-[2rem] border border-accent-muted/40 bg-[color:var(--theme-surface)] shadow-2xl overflow-hidden">
      <div className="bg-[color:var(--theme-canvas)] px-6 py-4 flex items-center justify-between border-b border-accent-periwinkle">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[color:var(--theme-text-muted)] uppercase tracking-widest">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[color:var(--theme-canvas)] border border-accent-periwinkle/80 px-2 py-0.5 rounded-full font-bold text-text-primary">
              {question.subject}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[color:var(--theme-canvas)] px-3 py-1.5 rounded-full border border-accent-periwinkle">
          <Timer className={`h-4 w-4 ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-text-primary"}`} />
          <span className={`text-sm font-black ${timeLeft < 10 ? "text-red-500" : "text-text-primary"}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="w-full bg-[color:var(--theme-borders-system)]/25 h-1">
        <div
          className={`h-full transition-all duration-500 ${timeLeft < 10 ? "bg-red-500" : "bg-primary-hover"}`}
          style={{ width: `${(timeLeft / 45) * 100}%` }}
        />
      </div>

      <div className="p-6 sm:p-8">
        <h3 className="text-lg font-bold text-text-primary mb-6 leading-relaxed">
          {question.questionText}
        </h3>

        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            return (                <button
                key={idx}
                onClick={() => onSelectOption(idx)}
                className={`w-full text-left p-4 sm:p-4 rounded-xl border-2 transition-all flex items-center gap-3 cursor-pointer min-h-[48px] ${
                  isSelected
                    ? "bg-primary border-primary-hover text-white font-bold shadow-sm"
                    : "bg-[color:var(--theme-surface)] border-accent-muted/30 text-[color:var(--theme-text-body)] hover:border-accent-periwinkle hover:bg-[color:var(--theme-canvas)]"
                }`}
              >
                <span className={`h-8 w-8 sm:h-6 sm:w-6 rounded-full flex items-center justify-center border text-sm sm:text-xs font-bold flex-shrink-0 ${
                  isSelected
                    ? "bg-white text-primary"
                    : "border-white/10 bg-[color:var(--theme-canvas)]/90 text-[color:var(--theme-text-muted)]"
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm sm:text-base">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[color:var(--theme-canvas)] border-t border-white/10 px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-[color:var(--theme-surface)] rounded-xl text-sm font-black border border-accent-muted text-[color:var(--theme-text-body)] hover:bg-[color:var(--theme-canvas)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[56px] transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl text-sm font-black border border-accent-muted shadow-sm hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[56px]"
        >
          {questionIndex < totalQuestions - 1 ? "Next Item" : "Finish Assessment"}
        </button>
      </div>
    </div>
  );
});

export default ReadinessQuestion;
