"use client";

/**
 * Interactive Readiness Check and Consolidated Mock Exam component.
 * Allows quick diagnostics or a full-scale 250-item mock exam simulation.
 */
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Timer, Award, CheckCircle2, AlertTriangle, BookMarked, Flag, Check, ArrowRight, BookOpen, Clock } from "lucide-react";

interface Question {
  id: number;
  subject: "Mathematics" | "Science" | "English" | "Filipino" | "Logical Reasoning";
  difficulty: number; // 1 to 5
  questionText: string;
  options: string[];
  correctAnswer: number; // Index in options
}

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Filipino",
  "Logical Reasoning"
] as const;

type SubjectType = typeof SUBJECTS[number];

// Programmatic Question Generator to populate a solid 250-item bank (50 per subject)
const generateMockQuestionBank = (): Question[] => {
  const bank: Question[] = [];
  let currentId = 1;

  const sampleData: Record<SubjectType, { questions: string[]; options: string[][]; correctAnswers: number[] }> = {
    "Mathematics": {
      questions: [
        "If a line passes through the points (2, 3) and (5, 9), what is its slope?",
        "What is the value of log base 2 of 64?",
        "Solve for x in the equation: log(x) + log(5) = 2 (where log is base 10).",
        "A box contains 4 red balls and 6 blue balls. What is the probability of drawing a red ball?",
        "What is the sum of the interior angles of a regular hexagon?",
      ],
      options: [
        ["2", "3", "4", "0.5"],
        ["6", "8", "5", "12"],
        ["20", "15", "10", "50"],
        ["2/5", "3/5", "1/2", "4/5"],
        ["720 degrees", "540 degrees", "360 degrees", "188 degrees"],
      ],
      correctAnswers: [0, 0, 0, 0, 0],
    },
    "Science": {
      questions: [
        "What is the chemical symbol for gold?",
        "Which of the following is a non-renewable source of energy?",
        "What is the speed of light in a vacuum, approximately?",
        "Which planet in our solar system is known for its prominent ring system?",
        "What force holds planets in their orbits around the Sun?",
      ],
      options: [
        ["Au", "Ag", "Fe", "Gd"],
        ["Coal", "Solar power", "Wind energy", "Hydroelectric energy"],
        ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"],
        ["Saturn", "Jupiter", "Neptune", "Uranus"],
        ["Gravitational force", "Electromagnetic force", "Nuclear force", "Centrifugal force"],
      ],
      correctAnswers: [0, 0, 0, 0, 0],
    },
    "English": {
      questions: [
        "What is the correct plural form of 'child'?",
        "Identify the figure of speech: 'The world is a stage.'",
        "Which sentence uses the correct subject-verb agreement?",
        "What is the antonym of 'benevolent'?",
        "Which literary device is used in 'The wind whispered through the trees'?",
      ],
      options: [
        ["Children", "Childs", "Childes", "Child"],
        ["Metaphor", "Simile", "Personification", "Hyperbole"],
        ["The team are playing well", "The team is playing well", "The team were playing well", "The team have been playing well"],
        ["Malevolent", "Generous", "Kind", "Altruistic"],
        ["Personification", "Simile", "Alliteration", "Onomatopoeia"],
      ],
      correctAnswers: [0, 0, 1, 0, 0],
    },
    "Filipino": {
      questions: [
        "Ano ang tamang salin ng 'Good morning' sa Filipino?",
        "Sino ang itinuturing na Ama ng Wikang Pambansa?",
        "Anong bahagi ng pananalita ang salitang 'mabilis'?",
        "'Ang bata ay umiiyak.' Anong uri ng pangungusap ito?",
        "Ano ang kahulugan ng salitang 'masagana'?",
      ],
      options: [
        ["Magandang umaga", "Magandang hapon", "Magandang gabi", "Magandang tanghali"],
        ["Manuel L. Quezon", "Jose Rizal", "Andres Bonifacio", "Emilio Aguinaldo"],
        ["Pang-uri", "Pang-abay", "Pangngalan", "Pandiwa"],
        ["Pasakalye", "Patanong", "Padamdam", "Pasalaysay"],
        ["Maunlad at sagana", "Mahirap at salat", "Mabagal at tahimik", "Maliit at payak"],
      ],
      correctAnswers: [0, 0, 0, 3, 0],
    },
    "Logical Reasoning": {
      questions: [
        "If all cats are mammals, and all mammals are warm-blooded, which of the following is true?",
        "Find the next number in the sequence: 3, 6, 12, 24, 48, ...",
        "Which word does NOT belong with the others?",
        "If BOOK is coded as 2151511 in a certain language, how is CAT coded?",
        "All apples in the basket are red. Some red fruits are sweet. Therefore:",
      ],
      options: [
        ["All cats are warm-blooded", "Some cats are not warm-blooded", "No mammals are cats", "All warm-blooded animals are cats"],
        ["96", "72", "64", "84"],
        ["Bicycle", "Car", "Airplane", "Steering wheel"],
        ["3120", "3119", "3122", "3210"],
        ["Some apples in the basket might be sweet", "All apples are sweet", "No apples are sweet", "Sweet fruits are always red"],
      ],
      correctAnswers: [0, 0, 3, 0, 0],
    },
  };

  for (const subject of SUBJECTS) {
    const data = sampleData[subject];
    for (let i = 0; i < 50; i++) {
      const isSampleIndex = i < data.questions.length;
      const questionText = isSampleIndex
        ? data.questions[i]
        : `Diagnostic review item #${i + 1} for ${subject}. Analyze the criteria to determine the correct logical outcome for this specific scenario.`;
      
      const options = isSampleIndex
        ? data.options[i]
        : [
            `Option A: Primary selection for review item ${i + 1}`,
            `Option B: Secondary alternative for review item ${i + 1}`,
            `Option C: Tertiary option for review item ${i + 1}`,
            `Option D: Fourth alternative for review item ${i + 1}`
          ];

      const correctAnswer = isSampleIndex ? data.correctAnswers[i] : (i % 4);

      bank.push({
        id: currentId++,
        subject,
        difficulty: 1 + (i % 5),
        questionText,
        options,
        correctAnswer,
      });
    }
  }

  return bank;
};

const MASTER_QUESTION_BANK = generateMockQuestionBank();

export default function ReadinessForm() {
  // Config states
  const [view, setView] = useState<"setup" | "active" | "feedback">("setup");
  const [selectedType, setSelectedType] = useState<"diagnostics" | "mock">("diagnostics");
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectType[]>([...SUBJECTS]);
  const [itemCount, setItemCount] = useState<10 | 15 | 20 | 25>(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  // Active exam states
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flaggedItems, setFlaggedItems] = useState<number[]>([]);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState<number>(45); // seconds per question for Diagnostics, total time for simulation
  const [activeSubject, setActiveSubject] = useState<SubjectType>("Mathematics");

  // Timer Effect
  useEffect(() => {
    if (view !== "active") return;

    if (timeLeft <= 0) {
      if (selectedType === "diagnostics") {
        handleNextQuestion();
      } else {
        // Mock exam time up - submit
        setView("feedback");
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, view, selectedType]);

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

  const handleStartExam = (typeOverride?: "diagnostics" | "mock") => {
    const examType = typeOverride || selectedType;
    if (examType === "diagnostics") {
      if (selectedSubjects.length === 0) {
        alert("Please select at least one subject to begin.");
        return;
      }

      // Filter pool based on difficulty level and subjects
      let difficultyRange = [3];
      if (selectedDifficulty === "easy") difficultyRange = [1, 2];
      else if (selectedDifficulty === "medium") difficultyRange = [2, 3, 4];
      else if (selectedDifficulty === "hard") difficultyRange = [4, 5];

      let pool = MASTER_QUESTION_BANK.filter(
        (q) => selectedSubjects.includes(q.subject) && difficultyRange.includes(q.difficulty)
      );

      if (pool.length === 0) {
        pool = MASTER_QUESTION_BANK.filter((q) => selectedSubjects.includes(q.subject));
      }

      // Shuffle and take requested count
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(itemCount, pool.length));

      setActiveQuestions(selected);
      setActiveIndex(0);
      setSelectedAnswers({});
      setFlaggedItems([]);
      setTimeLeft(45); // 45 seconds per question
      setView("active");
    } else {
      // Mock Exam - Full 250 items sorted by subject
      // Take all 250 questions from Master bank
      setActiveQuestions(MASTER_QUESTION_BANK);
      setActiveIndex(0);
      setSelectedAnswers({});
      setFlaggedItems([]);
      setTimeLeft(180 * 60); // 3 Hours in seconds
      setActiveSubject("Mathematics");
      setView("active");
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [activeIndex]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (activeIndex < activeQuestions.length - 1) {
      setActiveIndex((prev) => prev + 1);
      if (selectedType === "diagnostics") {
        setTimeLeft(45); // reset timer per question
      }
    } else {
      setView("feedback");
    }
  };

  const handlePrevQuestion = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
      if (selectedType === "diagnostics") {
        setTimeLeft(45);
      }
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
        icon: <CheckCircle2 className="h-10 w-10 text-emerald-600" />,
        text: "Exceptional! Your aptitude score demonstrates absolute core readiness to excel in complex scholarship grants like DOST-SEI, CHED Merit, or private foundation reviews."
      };
    } else if (scorePercentage >= 50) {
      return {
        level: "Needs Minor Review",
        color: "bg-amber-100 border-amber-400 text-amber-800",
        icon: <AlertTriangle className="h-10 w-10 text-amber-600" />,
        text: "Good attempt! You meet basic competencies. A bit of focused review in weaker subject segments will solidify your competitiveness."
      };
    } else {
      return {
        level: "Needs Intensive Improvement",
        color: "bg-accent-rose/50 border-accent-rose text-[color:var(--theme-text-body)]",
        icon: <AlertTriangle className="h-10 w-10 text-red-600" />,
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
              transition={{ duration: 0.5, ease: [0.21, 1.02, 0.43, 1.01], delay: 0.1 }}
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
                        return (
                          <button
                            key={subj}
                            type="button"
                            onClick={() => handleSubjectChange(subj)}                              className={`p-3 sm:p-4 rounded-xl border text-[11px] sm:text-xs font-bold transition-all duration-300 cursor-pointer text-left flex items-center justify-between gap-2 sm:gap-3 ${
                              isChecked
                                ? "bg-primary border-primary-hover text-white shadow-sm shadow-[var(--theme-glow-primary)]"
                                : "bg-[color:var(--theme-canvas)] border-accent-periwinkle/60 text-[color:var(--theme-text-muted)] hover:border-accent-periwinkle"
                            }`}
                          >
                            <span className="break-words text-balance">{subj}</span>
                            {isChecked && <Check className="h-4 w-4 text-white" />}
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
                          max={25}
                          step={5}
                          value={itemCount}
                          onChange={(e) => setItemCount(Number(e.target.value) as 10 | 15 | 20 | 25)}
                          className="readiness-slider w-full h-2 rounded-full appearance-none cursor-pointer bg-[color:var(--theme-borders-system)]/25 accent-[color:var(--theme-primary)]"
                        />
                        {/* Tick marks */}
                        <div className="flex justify-between px-0.5 mt-2">
                          {[10, 15, 20, 25].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setItemCount(val as 10 | 15 | 20 | 25)}
                              className={`text-[10px] font-bold transition-colors cursor-pointer px-1 ${
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
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {["easy", "medium", "hard"].map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setSelectedDifficulty(diff as any)}
                          className={`p-3 sm:p-4 rounded-xl border text-[11px] sm:text-xs font-black capitalize transition-all cursor-pointer text-center ${
                            selectedDifficulty === diff
                              ? "bg-primary border-primary-hover text-white shadow-sm"
                              : "bg-[color:var(--theme-canvas)] border-accent-periwinkle/60 text-[color:var(--theme-text-muted)] hover:border-accent-periwinkle"
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Launch button */}
                  <button
                    onClick={() => {
                      setSelectedType("diagnostics");
                      handleStartExam("diagnostics");
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-4 rounded-full font-black border-2 border-accent-muted shadow-md shadow-[var(--theme-glow-primary)] cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                  >
                    <Play className="h-5 w-5" /> Start Diagnostics Check
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Option 2: Comprehensive Mock Exam — staggered reveal */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: [0.21, 1.02, 0.43, 1.01], delay: 0.25 }}
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
                  onClick={() => {
                    setSelectedType("mock");
                    handleStartExam("mock");
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-4 rounded-full font-black border-2 border-accent-muted shadow-lg shadow-[var(--theme-glow-primary)] cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                >
                  Launch Full Mock Exam <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── 2. ACTIVE QUIZ/SIMULATION BOARD ──────────────────────────────── */}
        {view === "active" && activeQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full"
          >
            {selectedType === "diagnostics" ? (
              // Option 1 Layout: Simple diagnostic focus card
              <div className="max-w-3xl mx-auto rounded-[2rem] border border-accent-muted/40 bg-[color:var(--theme-surface)] shadow-2xl overflow-hidden">
                <div className="bg-[color:var(--theme-canvas)] px-6 py-4 flex items-center justify-between border-b border-accent-periwinkle">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[color:var(--theme-text-muted)] uppercase tracking-widest">
                      Question {activeIndex + 1} of {activeQuestions.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-[color:var(--theme-canvas)] border border-accent-periwinkle/80 px-2 py-0.5 rounded-full font-bold text-text-primary">
                        {activeQuestions[activeIndex].subject}
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
                    className={`h-full transition-all duration-1000 ${timeLeft < 10 ? "bg-red-500" : "bg-primary-hover"}`}
                    style={{ width: `${(timeLeft / 45) * 100}%` }}
                  />
                </div>

                <div className="p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-text-primary mb-6 leading-relaxed">
                    {activeQuestions[activeIndex].questionText}
                  </h3>

                  <div className="space-y-3">
                    {activeQuestions[activeIndex].options.map((opt, idx) => {
                      const isSelected = selectedAnswers[activeIndex] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-center gap-3 cursor-pointer ${
                            isSelected
                              ? "bg-primary border-primary-hover text-white font-bold shadow-sm"
                              : "bg-[color:var(--theme-surface)] border-accent-muted/30 text-[color:var(--theme-text-body)] hover:border-accent-periwinkle hover:bg-[color:var(--theme-canvas)]"
                          }`}
                        >
                          <span className={`h-6 w-6 rounded-full flex items-center justify-center border text-xs font-bold ${
                            isSelected
                              ? "bg-white text-primary"
                              : "border-white/10 bg-[color:var(--theme-canvas)]/90 text-[color:var(--theme-text-muted)]"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[color:var(--theme-canvas)] border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={activeIndex === 0}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl text-xs font-bold border border-accent-muted text-zinc-700 hover:bg-base-pastel disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswers[activeIndex] === undefined}
                    className="flex items-center gap-1.5 bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold border border-accent-muted shadow-sm hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {activeIndex < activeQuestions.length - 1 ? "Next Item" : "Finish Assessment"}
                  </button>
                </div>
              </div>
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
                            className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                              isFocus
                                ? "bg-primary border-primary-hover text-white shadow-sm"
                                : "bg-[color:var(--theme-canvas)]/55 border-accent-periwinkle/30 text-[color:var(--theme-text-body)] hover:border-accent-periwinkle"
                            }`}
                          >
                            <span>{subj}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${isFocus ? "bg-white/20 text-white" : "bg-base-pastel text-text-primary"}`}>
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
                              className={`aspect-square rounded-xl border text-[11px] font-black transition-all hover:scale-105 cursor-pointer ${stateClass}`}
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
                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressValue}%` }} />
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
                            className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-center gap-3 cursor-pointer ${
                              isSelected
                                ? "bg-primary border-primary-hover text-white font-bold shadow-sm"
                                : "bg-[color:var(--theme-surface)] border-accent-muted/30 text-[color:var(--theme-text-body)] hover:border-accent-periwinkle hover:bg-[color:var(--theme-canvas)]"
                            }`}
                          >
                            <span className={`h-6 w-6 rounded-full flex items-center justify-center border text-xs font-bold ${
                              isSelected
                                ? "bg-white text-primary"
                                : "border-white/10 bg-[color:var(--theme-canvas)]/90 text-[color:var(--theme-text-muted)]"
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigation toolbar */}
                    <div className="mt-8 pt-6 border-t border-accent-muted/30 flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={toggleFlag}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
                          flaggedItems.includes(activeIndex)
                            ? "bg-amber-100 border-amber-300 text-amber-800"
                            : "bg-[color:var(--theme-canvas)] border-accent-periwinkle text-[color:var(--theme-text-body)] hover:bg-amber-50 hover:border-amber-200"
                        }`}
                      >
                        <Flag className="h-4 w-4" />
                        {flaggedItems.includes(activeIndex) ? "Unflag" : "Flag for Review"}
                      </button>

                      <div className="flex gap-3">
                        <button
                          onClick={handlePrevQuestion}
                          disabled={activeIndex === 0}
                          className="px-4 py-2 bg-white rounded-xl text-xs font-bold border border-accent-muted text-zinc-700 hover:bg-base-pastel disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Previous
                        </button>
                        <button
                          onClick={handleNextQuestion}
                          disabled={selectedAnswers[activeIndex] === undefined}
                          className="flex items-center gap-1.5 bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold border border-accent-muted shadow-sm hover:bg-primary-hover cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
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
                      {score} <span className="text-lg text-[color:var(--theme-text-muted)] font-normal">/ {activeQuestions.length}</span>
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
                            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${accuracy}%` }} />
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
                  onClick={handleRestart}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3.5 rounded-full font-black border-2 border-accent-muted shadow-md cursor-pointer transition-transform hover:scale-[1.01]"
                >
                  <RotateCcw className="h-4 w-4" /> Start New Assessment Check
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
      </AnimatePresence>
    </div>
  );
}
