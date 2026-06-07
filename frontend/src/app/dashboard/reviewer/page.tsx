"use client";

/**
 * Dashboard reviewer page with a simulated timed question bank and analytics.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Flag,
  Play,
  ChevronRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface QuizQuestion {
  id: number;
  subject: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
}

const QUESTION_BANK: QuizQuestion[] = Array.from({ length: 50 }, (_, index) => {
  const subjects = ["English", "Science", "Abstract Reasoning", "Mathematics"];
  const subject = subjects[index % subjects.length];
  return {
    id: index + 1,
    subject,
    questionText: `Review item ${index + 1}: Analyze the prompt for ${subject} and choose the best answer.`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: index % 4,
  };
});

export default function ReviewerPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flaggedItems, setFlaggedItems] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(900);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    if (timeLeft === 0) {
      setFinished(true);
    }
    return () => window.clearInterval(timer);
  }, [timeLeft, finished]);

  const currentQuestion = QUESTION_BANK[activeIndex];
  const subjectScores = useMemo(() => {
    const result: Record<string, { correct: number; answered: number }> = {};
    QUESTION_BANK.forEach((question) => {
      result[question.subject] ??= { correct: 0, answered: 0 };
      const answer = selectedAnswers[question.id];
      if (answer !== undefined) {
        result[question.subject].answered += 1;
        if (answer === question.correctAnswer) {
          result[question.subject].correct += 1;
        }
      }
    });
    return result;
  }, [selectedAnswers]);

  const handleAnswer = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const toggleFlag = () => {
    setFlaggedItems((prev) =>
      prev.includes(currentQuestion.id)
        ? prev.filter((id) => id !== currentQuestion.id)
        : [...prev, currentQuestion.id]
    );
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = QUESTION_BANK.length;
  const progressValue = Math.round((answeredCount / totalCount) * 100);

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        className="rounded-2xl sm:rounded-[2rem] border border-accent-muted/30 bg-white p-4 sm:p-6 lg:p-8 shadow-2xl"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500 font-bold">Exam Reviewer Engine</p>
            <h1 className="font-display text-3xl font-black text-zinc-900 mt-3">Mock Test Workspace</h1>
            <p className="text-sm leading-relaxed text-zinc-600 mt-3 max-w-2xl">
              Navigate fifty review items with dynamic flagging, quick jump question grid, and subject analytics to help you identify strengths and focus areas.
            </p>
          </div>
          <div
            className={`rounded-3xl px-4 py-4 text-sm border shadow-sm ${
              timeLeft <= 120 ? "border-rose-400 bg-rose-50 text-rose-700" : "border-accent-muted/40 bg-base-pastel text-[color:var(--theme-text-body)]"
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-2">
              <Clock3 className="h-4 w-4 text-primary" />
              Countdown Timer
            </div>
            <div className="text-3xl font-black">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl sm:rounded-[2rem] border border-accent-muted/30 bg-white p-4 sm:p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500 font-bold">Question Map</p>
              <p className="text-sm font-bold text-zinc-900">{answeredCount}/{totalCount} Completed</p>
            </div>
            <button
              onClick={() => setFinished(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-bold uppercase tracking-[0.28em] text-white shadow-sm hover:bg-primary-hover transition-colors"
            >
              <Play className="h-3.5 w-3.5" /> Finish
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {QUESTION_BANK.map((question) => {
              const isActive = question.id - 1 === activeIndex;
              const answered = selectedAnswers[question.id] !== undefined;
              const statusClass = flaggedItems.includes(question.id)
                ? "bg-amber-300 text-zinc-900"
                : isActive
                ? "bg-primary text-white"
                : answered
                ? "bg-secondary text-white"
                : "bg-base-pastel text-[color:var(--theme-text-body)]";

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setActiveIndex(question.id - 1)}
                  className={`aspect-square rounded-2xl border border-accent-muted/30 text-[11px] font-bold transition-transform hover:scale-[1.02] focus:outline-none ${statusClass}`}
                  aria-label={`Jump to question ${question.id}`}
                >
                  {question.id}
                </button>
              );
            })}
          </div>

          <div className="mt-5 space-y-3 text-sm text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Active
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-base-pastel border border-zinc-300" /> Unattended
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" /> Flagged
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="rounded-2xl sm:rounded-[2rem] border border-accent-muted/30 bg-white p-4 sm:p-6 lg:p-8 shadow-2xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500 font-bold">Subject</p>
                <h2 className="font-display text-2xl font-black text-zinc-900 mt-2">{currentQuestion.subject}</h2>
              </div>
              <div className="rounded-3xl bg-base-pastel px-4 py-3 text-sm text-[color:var(--theme-text-body)] border border-accent-muted/40">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--theme-text-muted)]">Question</p>
                <p className="mt-1 text-lg font-black text-[color:var(--theme-typography-main)]">{currentQuestion.id}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-zinc-600">{currentQuestion.questionText}</p>

            <div role="radiogroup" aria-labelledby="choice-label" className="grid gap-3 mt-6">
              <p id="choice-label" className="sr-only">
                Answer choices
              </p>
              {currentQuestion.options.map((option, index) => {
                const selected = selectedAnswers[currentQuestion.id] === index;
                return (
                  <label
                    key={option}
                    className={`group flex cursor-pointer flex-col rounded-3xl border px-4 py-4 transition-all ${
                      selected ? "border-primary bg-primary text-white shadow-lg" : "border-accent-muted/40 bg-base-light text-[color:var(--theme-typography-main)] hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={selected}
                      onChange={() => handleAnswer(index)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{String.fromCharCode(65 + index)}.</span>
                      {selected && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed">{option}</p>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={toggleFlag}
                className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-sm font-bold text-zinc-700 hover:bg-amber-200 transition-colors"
              >
                <Flag className="h-4 w-4" /> {flaggedItems.includes(currentQuestion.id) ? "Unflag" : "Flag for review"}
              </button>
              <button
                onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
                className="inline-flex items-center gap-2 rounded-full border border-accent-muted bg-white px-4 py-2 text-sm font-bold text-zinc-900 hover:bg-base-pastel transition-colors"
              >
                <ChevronRight className="h-4 w-4 rotate-180" /> Previous
              </button>
              <button
                onClick={() => setActiveIndex((prev) => Math.min(prev + 1, totalCount - 1))}
                className="inline-flex items-center gap-2 rounded-full border border-accent-muted bg-white px-4 py-2 text-sm font-bold text-zinc-900 hover:bg-base-pastel transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <div className="rounded-2xl sm:rounded-[2rem] border border-accent-muted/30 bg-white p-4 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Progress</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-900">Answer completion</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
                  {progressValue}%
                </span>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-base-pastel">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressValue}%` }} />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.28em] text-zinc-500">{answeredCount} items answered out of {totalCount}</p>
            </div>
            <div className="rounded-2xl sm:rounded-[2rem] border border-accent-muted/30 bg-white p-4 sm:p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Performance Breakdown</p>
                  <p className="text-sm font-semibold text-zinc-900">Subject accuracy across review items</p>
                </div>
              </div>
              <div className="space-y-4">
                {Object.entries(subjectScores).map(([subject, stats]) => {
                  const score = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;
                  return (
                    <div key={subject}>
                      <div className="flex items-center justify-between text-xs text-zinc-600 uppercase tracking-[0.24em] font-bold mb-2">
                        <span>{subject}</span>
                        <span>{score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-base-pastel">
                        <div className="h-full rounded-full bg-secondary" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {finished && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl sm:rounded-[2rem] border border-accent-muted/30 bg-[#f6fff0] p-4 sm:p-6 shadow-2xl"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-primary text-white shadow-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black text-zinc-900">Review Complete</p>
                <p className="text-xs text-zinc-600 mt-1">Your performance dashboard is ready. Review strengths and flagged items before reattempting the simulation.</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-zinc-700 border border-accent-muted/40">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Finished
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
