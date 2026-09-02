"use client";

/**
 * Interactive Readiness Check and Consolidated Mock Exam component.
 * Thin orchestrator — child components are code-split via next/dynamic.
 */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Flag } from "lucide-react";
import { fetchQuestions } from "@/lib/backend";

// ─── Code-split child components ──────────────────────────────────────────
const ReadinessSetup = dynamic(() => import("./readiness-setup"), {
  loading: () => <div className="h-[600px] animate-pulse rounded-[2rem] bg-[color:var(--theme-surface)]" />,
});
const ReadinessQuestion = dynamic(() => import("./readiness-question"), {
  loading: () => <div className="h-[400px] animate-pulse rounded-[2rem] bg-[color:var(--theme-surface)]" />,
});
const ReadinessFeedback = dynamic(() => import("./readiness-feedback"), {
  loading: () => <div className="h-[500px] animate-pulse rounded-[2rem] bg-[color:var(--theme-surface)]" />,
});

// ─── Types ─────────────────────────────────────────────────────────────────
const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Filipino",
  "Logical Reasoning"
] as const;

type SubjectType = typeof SUBJECTS[number];

interface Question {
  id: number;
  subject: SubjectType;
  difficulty: number;
  questionText: string;
  options: string[];
  correctAnswer: number;
}

export default function ReadinessForm() {
  // Config states
  const [view, setView] = useState<"setup" | "active" | "feedback">("setup");
  const [selectedType, setSelectedType] = useState<"diagnostics" | "mock">("diagnostics");
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectType[]>([...SUBJECTS]);
  const [itemCount, setItemCount] = useState<10 | 20 | 30 | 40 | 50>(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);

  // Question-fetch states
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Active exam states
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flaggedItems, setFlaggedItems] = useState<number[]>([]);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [activeSubject, setActiveSubject] = useState<SubjectType>("Mathematics");

  // Stable callbacks (declared before timer effect to avoid used-before-declaration)
  const handleSelectOption = useCallback((optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [activeIndex]: optionIndex,
    }));
  }, [activeIndex]);

  const handleNextQuestion = useCallback(() => {
    if (activeIndex < activeQuestions.length - 1) {
      setActiveIndex((prev) => prev + 1);
      if (selectedType === "diagnostics") {
        setTimeLeft(45);
      }
    } else {
      setView("feedback");
    }
  }, [activeIndex, activeQuestions.length, selectedType]);

  const handlePrevQuestion = useCallback(() => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
      if (selectedType === "diagnostics") {
        setTimeLeft(45);
      }
    }
  }, [activeIndex, selectedType]);

  // Timer Effect
  useEffect(() => {
    if (view !== "active") return;

    if (timeLeft <= 0) {
      if (selectedType === "diagnostics") {
        handleNextQuestion();
      } else {
        setView("feedback");
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, view, selectedType, handleNextQuestion]);

  // Sync active subject in mock exam when active question changes
  useEffect(() => {
    if (view === "active" && selectedType === "mock" && activeQuestions[activeIndex]) {
      setActiveSubject(activeQuestions[activeIndex].subject);
    }
  }, [activeIndex, activeQuestions, view, selectedType]);

  // Subject indices mappings for Option 2 (Mock Exam)
  const subjectStartIndex = (subj: SubjectType) => {
    const idx = SUBJECTS.indexOf(subj);
    return idx * 50;
  };

  const handleSubjectChange = (subject: SubjectType) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleStartExam = async (typeOverride?: "diagnostics" | "mock") => {
    const examType = typeOverride || selectedType;
    if (examType === "diagnostics" && selectedSubjects.length === 0) {
      alert("Please select at least one subject to begin.");
      return;
    }

    setLoadError(null);
    setIsLoadingQuestions(true);
    try {
      const questions = await fetchQuestions(
        examType === "diagnostics"
          ? { mode: "diagnostic", subjects: selectedSubjects, difficulty: [selectedDifficulty], count: itemCount }
          : { mode: "mock" }
      );

      setActiveQuestions(questions);
      setActiveIndex(0);
      setSelectedAnswers({});
      setFlaggedItems([]);
      if (examType === "diagnostics") {
        setTimeLeft(45);
      } else {
        setTimeLeft(180 * 60);
        setActiveSubject("Mathematics");
      }
      setView("active");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Readiness] Failed to load questions:", message);
      setLoadError(
        err instanceof TypeError
          ? "We couldn't connect to the server. It may be waking up from sleep — please try again in a moment."
          : `We couldn't load questions: ${message}`
      );
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const toggleFlag = () => {
    setFlaggedItems((prev) =>
      prev.includes(activeIndex)
        ? prev.filter((i) => i !== activeIndex)
        : [...prev, activeIndex]
    );
  };

  const handleFinishExam = () => {
    const unanswered = activeQuestions.length - Object.keys(selectedAnswers).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered questions. Are you sure you want to finish the exam?`)) {
        return;
      }
    }
    setView("feedback");
  };

  const handleRestart = () => {
    setView("setup");
    setSelectedAnswers({});
    setFlaggedItems([]);
    setActiveIndex(0);
    setLoadError(null);
  };

  // Computations
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressValue = activeQuestions.length > 0 ? Math.round((answeredCount / activeQuestions.length) * 100) : 0;

  const score = useMemo(() => {
    let correct = 0;
    activeQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  }, [activeQuestions, selectedAnswers]);

  const scorePercentage = useMemo(() => {
    if (activeQuestions.length === 0) return 0;
    return Math.round((score / activeQuestions.length) * 100);
  }, [score, activeQuestions]);

  const subjectScores = useMemo(() => {
    const scores: Record<SubjectType, { correct: number; total: number; answered: number }> = {
      "Mathematics": { correct: 0, total: 0, answered: 0 },
      "Science": { correct: 0, total: 0, answered: 0 },
      "English": { correct: 0, total: 0, answered: 0 },
      "Filipino": { correct: 0, total: 0, answered: 0 },
      "Logical Reasoning": { correct: 0, total: 0, answered: 0 },
    };

    activeQuestions.forEach((q, index) => {
      scores[q.subject].total += 1;
      const ans = selectedAnswers[index];
      if (ans !== undefined) {
        scores[q.subject].answered += 1;
        if (ans === q.correctAnswer) {
          scores[q.subject].correct += 1;
        }
      }
    });

    return scores;
  }, [activeQuestions, selectedAnswers]);

  const readinessDetails = useMemo(() => {
    if (scorePercentage >= 80) {
      return {
        level: "Highly Prepared",
        color: "bg-emerald-100 border-emerald-400 text-emerald-800",
        icon: <span className="text-emerald-600">✓</span>,
        text: "Exceptional! Your aptitude score demonstrates absolute core readiness to excel in complex scholarship grants like DOST-SEI, CHED Merit, or private foundation reviews."
      };
    } else if (scorePercentage >= 50) {
      return {
        level: "Needs Minor Review",
        color: "bg-amber-100 border-amber-400 text-amber-800",
        icon: <span className="text-amber-600">⚠</span>,
        text: "Good attempt! You meet basic competencies. A bit of focused review in weaker subject segments will solidify your competitiveness."
      };
    } else {
      return {
        level: "Needs Intensive Improvement",
        color: "bg-accent-rose/50 border-accent-rose",
        icon: <span className="text-red-600">⚠</span>,
        text: "Don't worry! This is a roadmap indicator. Focus on targeted study modules to strengthen your primary vocabulary, mathematical formulas, and scientific facts."
      };
    }
  }, [scorePercentage]);

  const studyRecommendations = useMemo(() => {
    const recs: string[] = [];
    Object.entries(subjectScores).forEach(([subj, stats]) => {
      const accuracy = stats.answered > 0 ? (stats.correct / stats.answered) * 100 : 0;
      if (stats.total > 0 && accuracy < 75) {
        if (subj === "Mathematics") recs.push("Mathematics: Practice linear equations, trigonometric ratios, logarithm conversions, and basic probability sets.");
        if (subj === "Science") recs.push("Science: Memorize key element configurations, chemical formula nomenclature, physics kinematics, and atmospheric stratification layers.");
        if (subj === "English") recs.push("English: Review grammar rules, literary devices, subject-verb agreement, and vocabulary building exercises.");
        if (subj === "Filipino") recs.push("Filipino: Practice grammar structures (balarila), figure of speech identification, and reading comprehension in Filipino.");
        if (subj === "Logical Reasoning") recs.push("Logical Reasoning: Strengthen deductive logic arguments, numerical pattern sequencing, and lexical classification filters.");
      }
    });

    if (recs.length === 0) {
      recs.push("Review all topics briefly to sustain your high performance across subjects!");
    }
    return recs;
  }, [subjectScores]);

  return (
    <div className="w-full mx-auto font-sans">
      <AnimatePresence mode="wait">
        
        {/* ── 1. SETUP CONFIGURATION LAYER ─────────────────────────────────── */}
        {view === "setup" && (
          <ReadinessSetup
            selectedSubjects={selectedSubjects}
            onSubjectChange={handleSubjectChange}
            itemCount={itemCount}
            onItemCountChange={setItemCount}
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={setSelectedDifficulty}
            isLoading={isLoadingQuestions}
            loadError={loadError}
            onStartDiagnostics={() => {
              setSelectedType("diagnostics");
              handleStartExam("diagnostics");
            }}
            onStartMockExam={() => {
              setSelectedType("mock");
              handleStartExam("mock");
            }}
          />
        )}

        {/* ── 2. ACTIVE QUIZ/SIMULATION BOARD ──────────────────────────────── */}
        {view === "active" && activeQuestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full"
          >
            <div className="rounded-[2rem] border border-accent-rose/30 bg-accent-rose/10 p-8 sm:p-10 text-center space-y-4">
              <p className="text-lg font-black text-text-primary">No questions available</p>
              <p className="text-sm text-[color:var(--theme-text-body)]">
                The question bank appears to be empty. The server may still be seeding the database — please try again in a moment.
              </p>
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full font-black text-sm cursor-pointer transition-colors"
              >
                Back to Setup
              </button>
            </div>
          </motion.div>
        )}

        {view === "active" && activeQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full"
          >
            {selectedType === "diagnostics" ? (
              <ReadinessQuestion
                question={activeQuestions[activeIndex]}
                questionIndex={activeIndex}
                totalQuestions={activeQuestions.length}
                selectedAnswer={selectedAnswers[activeIndex]}
                onSelectOption={handleSelectOption}
                onNext={handleNextQuestion}
                onPrev={handlePrevQuestion}
                timeLeft={timeLeft}
                canGoNext={selectedAnswers[activeIndex] !== undefined}
                canGoPrev={activeIndex > 0}
              />
            ) : (
              // Option 2 Layout: Massive Mock Exam split viewport (sidebar navigation + matrix)
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left persistent subject navigator & question grid */}
                <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto">
                  <div className="rounded-[2rem] border border-accent-muted/30 bg-[color:var(--theme-surface)] p-6 shadow-2xl space-y-5">
                    
                    {/* Header summary */}
                    <div className="flex justify-between items-start pb-4 border-b border-accent-muted/40">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[color:var(--theme-text-muted)] font-black">Simulation Map</p>
                        <p className="text-base font-black text-text-primary mt-1">{answeredCount} of 250 Completed</p>
                      </div>
                      <button
                        onClick={handleFinishExam}
                        className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md cursor-pointer transition-colors"
                      >
                        Finish Exam
                      </button>
                    </div>

                    {/* Subjects Menu */}
                    <div className="space-y-2">
                      {SUBJECTS.map((subj) => {
                        const start = subjectStartIndex(subj);
                        const answeredInSubj = Array.from({ length: 50 }, (_, i) => selectedAnswers[start + i] !== undefined).filter(Boolean).length;
                        const isFocus = activeSubject === subj;
                        
                        return (
                          <button
                            key={subj}
                            type="button"
                            onClick={() => {
                              setActiveSubject(subj);
                              setActiveIndex(start);
                            }}
                            className={`w-full text-left p-4 rounded-xl border text-sm sm:text-xs font-bold transition-all flex items-center justify-between min-h-[48px] ${
                              isFocus
                                ? "bg-primary border-primary-hover text-white shadow-sm"
                                : "bg-[color:var(--theme-canvas)]/55 border-accent-periwinkle/30 text-[color:var(--theme-text-body)] hover:border-accent-periwinkle"
                            }`}
                          >
                            <span>{subj}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs sm:text-[10px] ${isFocus ? "bg-white/20 text-white" : "bg-base-pastel text-text-primary"}`}>
                              {answeredInSubj}/50
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Questions Matrix scroll container */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--theme-text-muted)]">
                        {activeSubject} Matrix:
                      </p>
                      <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto pr-1">
                        {Array.from({ length: 50 }).map((_, i) => {
                          const globalIdx = subjectStartIndex(activeSubject) + i;
                          const isActive = globalIdx === activeIndex;
                          const answered = selectedAnswers[globalIdx] !== undefined;
                          const flagged = flaggedItems.includes(globalIdx);

                          let stateClass = "bg-[color:var(--theme-canvas)] border-accent-periwinkle/35 text-[color:var(--theme-text-body)]";
                          if (flagged) {
                            stateClass = "bg-amber-300 border-amber-400 text-zinc-900";
                          } else if (isActive) {
                            stateClass = "bg-primary border-primary-hover text-white";
                          } else if (answered) {
                            stateClass = "bg-emerald-600 border-emerald-700 text-white";
                          }

                          return (
                            <button
                              key={globalIdx}
                              onClick={() => setActiveIndex(globalIdx)}
                              className={`aspect-square min-h-[44px] rounded-xl border text-sm sm:text-[11px] font-black transition-all hover:scale-105 cursor-pointer ${stateClass}`}
                            >
                              {i + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-[color:var(--theme-text-body)] opacity-85 pt-3 border-t border-accent-muted/20">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded bg-primary" /> Active
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded bg-emerald-600" /> Answered
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded bg-[color:var(--theme-canvas)] border border-accent-periwinkle" /> Unattended
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded bg-amber-300" /> Flagged
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Right Question card panel */}
                <main className="lg:col-span-8 space-y-6">
                  {/* Timer widget & overall progress */}
                  <div className="rounded-[2rem] border border-accent-muted/30 bg-[color:var(--theme-surface)] p-6 shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[color:var(--theme-text-muted)] font-black">Remaining Time</p>
                        <p className="text-2xl font-black text-text-primary">
                          {Math.floor(timeLeft / 3600)}h {Math.floor((timeLeft % 3600) / 60)}m {timeLeft % 60}s
                        </p>
                      </div>
                    </div>
                    <div className="w-full sm:max-w-xs space-y-2">
                      <div className="flex justify-between text-xs font-bold text-text-primary">
                        <span>Completion Rate</span>
                        <span>{progressValue}%</span>
                      </div>
                      <div className="h-2.5 bg-base-pastel rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progressValue}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Question Container */}
                  <div className="rounded-[2rem] border border-accent-muted/30 bg-[color:var(--theme-surface)] p-6 sm:p-8 shadow-2xl">
                    <div className="flex justify-between items-center pb-4 mb-6 border-b border-accent-muted/35">
                      <span className="text-xs bg-[color:var(--theme-canvas)] border border-accent-periwinkle px-3 py-1 rounded-full font-bold text-text-primary">
                        {activeQuestions[activeIndex].subject}
                      </span>
                      <span className="text-xs text-[color:var(--theme-text-muted)] font-black uppercase tracking-widest">
                        Item {activeIndex - subjectStartIndex(activeQuestions[activeIndex].subject) + 1} of 50
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-text-primary mb-6 leading-relaxed">
                      {activeQuestions[activeIndex].questionText}
                    </h3>

                    <div className="space-y-3">
                      {activeQuestions[activeIndex].options.map((opt, idx) => {
                        const isSelected = selectedAnswers[activeIndex] === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectOption(idx)}
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

                    {/* Navigation toolbar */}
                    <div className="mt-8 pt-6 border-t border-accent-muted/30 flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={toggleFlag}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm sm:text-xs font-bold transition-colors cursor-pointer min-h-[44px] ${
                          flaggedItems.includes(activeIndex)
                            ? "bg-amber-100 border-amber-300 text-amber-800"
                            : "bg-[color:var(--theme-canvas)] border-accent-periwinkle text-[color:var(--theme-text-body)] hover:bg-[color:var(--theme-surface)] hover:border-accent-periwinkle"
                        }`}
                      >
                        <Flag className="h-4 w-4" />
                        {flaggedItems.includes(activeIndex) ? "Unflag" : "Flag for Review"}
                      </button>

                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                          onClick={handlePrevQuestion}
                          disabled={activeIndex === 0}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-[color:var(--theme-surface)] rounded-xl text-sm font-black border border-accent-muted text-[color:var(--theme-text-body)] hover:bg-[color:var(--theme-canvas)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[56px] transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={handleNextQuestion}
                          disabled={selectedAnswers[activeIndex] === undefined}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl text-sm font-black border border-accent-muted shadow-sm hover:bg-primary-hover cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[56px] transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            )}
          </motion.div>
        )}

        {/* ── 3. EVALUATION AND SCORE RESULTS FEEDBACK ──────────────────────── */}
        {view === "feedback" && (
          <ReadinessFeedback
            score={score}
            total={activeQuestions.length}
            scorePercentage={scorePercentage}
            subjectScores={subjectScores}
            readinessDetails={readinessDetails}
            studyRecommendations={studyRecommendations}
            onRestart={handleRestart}
          />
        )}
        
      </AnimatePresence>
    </div>
  );
}
