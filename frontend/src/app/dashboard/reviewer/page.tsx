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
    <div className="space-y-10">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        style={{ willChange: "transform, opacity" }}
        className="border-technical bg-[color:var(--theme-surface)] p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />
        
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">[SYS: REVIEW_ENGINE]</span>
              <div className="h-px w-12 bg-primary/20" />
            </div>
            <h1 className="font-display text-4xl font-black text-[color:var(--theme-typography-main)] uppercase tracking-technical leading-tight">
              Mock Test Workspace
            </h1>
            <p className="text-sm leading-relaxed text-[color:var(--theme-text-body)] max-w-2xl font-medium uppercase tracking-wide opacity-80">
              Navigate fifty review items with dynamic flagging, quick jump question grid, and subject analytics to identify strengths and focus areas.
            </p>
          </div>
          <div
            className={`border-technical p-8 shadow-sm min-w-[240px] space-y-4 ${
              timeLeft <= 120 ? "bg-rose-50 border-rose-400" : "bg-[color:var(--theme-surface)]/50"
            }`}
          >
            <div className="flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] text-primary">
              <Clock3 className="h-4 w-4" />
              Time Remaining
            </div>
            <div className="text-4xl font-mono font-black tracking-tighter">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </div>
          </div>
        </div>
      </motion.header>

      <div className="grid gap-0 lg:grid-cols-[300px_1fr] border-technical bg-[color:var(--theme-surface)] shadow-2xl overflow-hidden">
        <aside className="p-8 border-b lg:border-b-0 lg:border-r border-technical bg-[color:var(--theme-surface)]/30">
          <div className="flex items-center justify-between mb-10 pb-4 border-b border-technical">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Map</p>
              <p className="text-[9px] font-mono text-[color:var(--theme-text-muted)] uppercase">{answeredCount}/{totalCount} Units</p>
            </div>
            <button
              onClick={() => setFinished(true)}
              className="bg-primary text-white px-6 py-2 text-[9px] font-black uppercase tracking-[0.3em] shadow-xl hover:translate-y-[-1px] transition-all"
            >
              Finalize
            </button>
          </div>

          <div className="grid grid-cols-5 gap-0 border-technical bg-[color:var(--theme-surface)] overflow-hidden">
            {QUESTION_BANK.map((question) => {
              const isActive = question.id - 1 === activeIndex;
              const answered = selectedAnswers[question.id] !== undefined;
              const statusClass = flaggedItems.includes(question.id)
                ? "bg-amber-300 text-zinc-900"
                : isActive
                ? "bg-primary text-white"
                : answered
                ? "bg-[color:var(--theme-surface)] text-primary"
                : "bg-[color:var(--theme-canvas)] text-[color:var(--theme-text-muted)]";

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setActiveIndex(question.id - 1)}
                  className={`aspect-square border-r border-b border-technical last:border-r-0 text-[10px] font-mono font-black transition-all hover:bg-[color:var(--theme-surface)] focus:outline-none ${statusClass}`}
                >
                  {String(question.id).padStart(2, '0')}
                </button>
              );
            })}
          </div>

          <div className="mt-10 space-y-4">
            {[
              { label: "Active", color: "bg-primary" },
              { label: "Answered", color: "bg-[color:var(--theme-surface)] border border-technical" },
              { label: "Unattended", color: "bg-white border border-technical" },
              { label: "Flagged", color: "bg-amber-300" }
            ].map(status => (
              <div key={status.label} className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-[color:var(--theme-text-muted)]">
                <span className={`h-2.5 w-2.5 ${status.color}`} /> {status.label}
              </div>
            ))}
          </div>
        </aside>

        <section className="bg-[color:var(--theme-surface)] flex flex-col">
          <div className="p-12 space-y-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Domain</span>
                </div>
                <h2 className="text-3xl font-black text-[color:var(--theme-typography-main)] uppercase tracking-technical leading-tight">
                  {currentQuestion.subject}
                </h2>
              </div>
              <div className="border-technical bg-[color:var(--theme-surface)]/50 p-6 min-w-[120px] text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[color:var(--theme-text-muted)]">Unit ID</p>
                <p className="mt-2 text-2xl font-mono font-black text-primary">#{String(currentQuestion.id).padStart(2, '0')}</p>
              </div>
            </div>

            <p className="text-lg font-medium leading-relaxed text-[color:var(--theme-text-body)] tracking-technical">
              {currentQuestion.questionText}
            </p>

            <div role="radiogroup" className="grid gap-0 border-technical">
              {currentQuestion.options.map((option, index) => {
                const selected = selectedAnswers[currentQuestion.id] === index;
                return (
                  <label
                    key={option}
                    className={`group flex cursor-pointer items-center gap-8 border-b border-technical last:border-b-0 px-8 py-6 transition-all ${
                      selected ? "bg-primary text-white" : "bg-[color:var(--theme-surface)] text-[color:var(--theme-text-body)] hover:bg-[color:var(--theme-canvas)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={selected}
                      onChange={() => handleAnswer(index)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-8">
                        <span className={`text-[10px] font-mono font-black ${selected ? "text-white/60" : "text-primary"}`}>
                          [{String.fromCharCode(65 + index)}]
                        </span>
                        <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">{option}</p>
                      </div>
                      {selected && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={toggleFlag}
                className={`inline-flex items-center gap-3 border-technical px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:translate-y-[-1px] ${
                  flaggedItems.includes(currentQuestion.id) ? "bg-amber-300 border-amber-400 text-zinc-900" : "bg-[color:var(--theme-surface)] text-[color:var(--theme-text-body)] hover:bg-[color:var(--theme-canvas)]"
                }`}
              >
                <Flag className="h-4 w-4" /> {flaggedItems.includes(currentQuestion.id) ? "De-flag" : "Flag Unit"}
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
                disabled={activeIndex === 0}
                className="inline-flex items-center gap-3 border-technical bg-[color:var(--theme-surface)] px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-[color:var(--theme-text-body)] hover:bg-[color:var(--theme-canvas)] transition-all disabled:opacity-20"
              >
                Previous
              </button>
              <button
                onClick={() => setActiveIndex((prev) => Math.min(prev + 1, totalCount - 1))}
                disabled={activeIndex === totalCount - 1}
                className="inline-flex items-center gap-3 bg-primary text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:translate-y-[-1px] transition-all disabled:opacity-20"
              >
                Next Unit <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-auto border-t border-technical bg-[color:var(--theme-surface)]/30 p-12 grid gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Progress</p>
                  <p className="text-[11px] font-bold text-[color:var(--theme-typography-main)] uppercase tracking-widest">Answer Completion</p>
                </div>
                <span className="text-xl font-mono font-black text-primary">
                  {progressValue}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 border-technical">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressValue}%` }} />
              </div>
              <p className="text-[9px] font-mono text-[color:var(--theme-text-muted)] uppercase">[{answeredCount} / {totalCount} UNITS COMMITTED]</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-primary" />
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Breakdown</p>
                  <p className="text-[11px] font-bold text-[color:var(--theme-typography-main)] uppercase tracking-widest">Domain Performance</p>
                </div>
              </div>
              <div className="space-y-4">
                {Object.entries(subjectScores).map(([subject, stats]) => {
                  const score = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;
                  return (
                    <div key={subject} className="space-y-2">
                      <div className="flex items-center justify-between text-[8px] font-mono text-[color:var(--theme-text-muted)] uppercase">
                        <span>{subject}</span>
                        <span>{score}%</span>
                      </div>
                      <div className="h-1 bg-gray-100">
                        <div className="h-full bg-primary/60" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {finished && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-technical bg-emerald-50 p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500" />
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 border-technical bg-emerald-500 flex items-center justify-center text-white shadow-xl">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-black text-emerald-900 uppercase tracking-technical">Simulation Complete</p>
                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest opacity-80">
                  Performance dashboard ready. Review strengths before re-initializing protocol.
                </p>
              </div>
            </div>
            <div className="border-technical bg-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700 shadow-sm flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4" /> Finished
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
