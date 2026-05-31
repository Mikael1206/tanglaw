"use client";

/**
 * Interactive readiness assessment form for the student dashboard.
 * Presents timed quiz questions and generates a readiness score.
 */
import React, { useState, useEffect, useMemo } from "react";
import { Play, RotateCcw, Timer, Award, CheckCircle2, AlertTriangle, BookMarked, HelpCircle, ChevronRight } from "lucide-react";

interface Question {
  id: number;
  subject: "Mathematics" | "Science" | "English" | "Filipino";
  difficulty: number; // 1 to 5
  questionText: string;
  options: string[];
  correctAnswer: number; // Index in options
}

const QUESTIONS_POOL: Question[] = [
  // Mathematics
  {
    id: 1,
    subject: "Mathematics",
    difficulty: 2,
    questionText: "If 3x + 7 = 22, what is the value of x?",
    options: ["x = 3", "x = 5", "x = 6", "x = 7"],
    correctAnswer: 1
  },
  {
    id: 2,
    subject: "Mathematics",
    difficulty: 3,
    questionText: "Find the limit of (x^2 - 4) / (x - 2) as x approaches 2.",
    options: ["2", "4", "0", "Undefined"],
    correctAnswer: 1
  },
  {
    id: 3,
    subject: "Mathematics",
    difficulty: 4,
    questionText: "What is the derivative of f(x) = 3x^2 + 5x - 9 with respect to x?",
    options: ["6x + 5", "3x + 5", "6x^2 + 5", "6x"],
    correctAnswer: 0
  },
  {
    id: 4,
    subject: "Mathematics",
    difficulty: 1,
    questionText: "What is the perimeter of a rectangle with length 12cm and width 5cm?",
    options: ["17cm", "60cm", "34cm", "45cm"],
    correctAnswer: 2
  },
  {
    id: 5,
    subject: "Mathematics",
    difficulty: 5,
    questionText: "In a right triangle, if the hypotenuse is 13 and one leg is 5, what is the length of the other leg?",
    options: ["8", "12", "10", "11"],
    correctAnswer: 1
  },

  // Science
  {
    id: 6,
    subject: "Science",
    difficulty: 1,
    questionText: "Which gas do plants absorb from the atmosphere for photosynthesis?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    correctAnswer: 2
  },
  {
    id: 7,
    subject: "Science",
    difficulty: 2,
    questionText: "What is the chemical formula for ordinary table salt?",
    options: ["NaCl", "HCl", "NaOH", "KCl"],
    correctAnswer: 0
  },
  {
    id: 8,
    subject: "Science",
    difficulty: 3,
    questionText: "Which law states that for every action, there is an equal and opposite reaction?",
    options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Universal Gravitation"],
    correctAnswer: 2
  },
  {
    id: 9,
    subject: "Science",
    difficulty: 4,
    questionText: "What organelle is known as the powerhouse of the eukaryotic cell?",
    options: ["Nucleus", "Ribosome", "Golgi Apparatus", "Mitochondria"],
    correctAnswer: 3
  },
  {
    id: 10,
    subject: "Science",
    difficulty: 5,
    questionText: "Which layer of the atmosphere contains the ozone layer that protects us from ultraviolet rays?",
    options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"],
    correctAnswer: 1
  },

  // English
  {
    id: 11,
    subject: "English",
    difficulty: 1,
    questionText: "Identify the conjunction in this sentence: 'He wanted to join the class, but he forgot to enroll.'",
    options: ["wanted", "join", "but", "forgot"],
    correctAnswer: 2
  },
  {
    id: 12,
    subject: "English",
    difficulty: 2,
    questionText: "Select the sentence with the correct subject-verb agreement.",
    options: [
      "The pack of wolves are running in the forest.",
      "The pack of wolves is running in the forest.",
      "The pack of wolves run in the forest.",
      "The wolves runs in the forest."
    ],
    correctAnswer: 1
  },
  {
    id: 13,
    subject: "English",
    difficulty: 3,
    questionText: "What is the synonym of the word 'Metaphorical'?",
    options: ["Literal", "Symbolic", "Factual", "Intense"],
    correctAnswer: 1
  },
  {
    id: 14,
    subject: "English",
    difficulty: 4,
    questionText: "Choose the correct prepositions to fill the blanks: 'She was ashamed ___ her behavior ___ the party.'",
    options: ["of / at", "about / in", "for / during", "with / on"],
    correctAnswer: 0
  },
  {
    id: 15,
    subject: "English",
    difficulty: 5,
    questionText: "What figure of speech is represented in: 'The wind whispered secrets to the trembling trees'?",
    options: ["Simile", "Metaphor", "Personification", "Hyperbole"],
    correctAnswer: 2
  },

  // Filipino
  {
    id: 16,
    subject: "Filipino",
    difficulty: 1,
    questionText: "Ano ang kahulugan ng salitang 'aklat' sa wikang Filipino?",
    options: ["Notebook", "Papel", "Lapis", "Libro"],
    correctAnswer: 3
  },
  {
    id: 17,
    subject: "Filipino",
    difficulty: 2,
    questionText: "Alin ang may wastong baybay ng salita ayon sa Ortograpiyang Pambansa?",
    options: ["Kompuyter", "Kompyuter", "Computery", "Kumputer"],
    correctAnswer: 1
  },
  {
    id: 18,
    subject: "Filipino",
    difficulty: 3,
    questionText: "Piliin ang wastong gamit ng 'ng' at 'nang'. 'Kumain ___ saging ang bata ___ mabilis.'",
    options: ["nang / ng", "ng / nang", "ng / ng", "nang / nang"],
    correctAnswer: 1
  },
  {
    id: 19,
    subject: "Filipino",
    difficulty: 4,
    questionText: "Sino ang kinikilalang 'Ama ng Wikang Pambansa' ng Pilipinas?",
    options: ["Jose Rizal", "Andres Bonifacio", "Manuel L. Quezon", "Francisco Balagtas"],
    correctAnswer: 2
  },
  {
    id: 20,
    subject: "Filipino",
    difficulty: 5,
    questionText: "Ano ang tayutay na naghahambing gamit ang mga pariralang 'tila', 'parang', at 'kasing-'?",
    options: ["Pagtutulad (Simile)", "Pagwawangis (Metaphor)", "Pagsasatao (Personification)", "Pagmamalabis (Hyperbole)"],
    correctAnswer: 0
  }
];

export default function ReadinessForm() {
  // Config state
  const [itemCount, setItemCount] = useState(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState(3);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["Mathematics", "Science", "English"]);

  // Game state
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(45); // Seconds per question

  // Timer Effect
  useEffect(() => {
    if (!quizStarted || quizFinished) return;

    if (timeLeft <= 0) {
      // Auto-move or auto-fail question
      handleNextQuestion();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizStarted, quizFinished]);

  const handleSubjectChange = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleStartQuiz = () => {
    if (selectedSubjects.length === 0) {
      alert("Please select at least one subject to start the assessment.");
      return;
    }

    // Filter pool based on selections
    let pool = QUESTIONS_POOL.filter(
      (q) => selectedSubjects.includes(q.subject) && Math.abs(q.difficulty - selectedDifficulty) <= 1
    );

    // If pool is empty, fall back to matching subjects
    if (pool.length === 0) {
      pool = QUESTIONS_POOL.filter((q) => selectedSubjects.includes(q.subject));
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    // Take requested item count (or pool length, whichever is smaller)
    const selected = shuffled.slice(0, Math.min(itemCount, pool.length));

    setActiveQuestions(selected);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setTimeLeft(45);
    setQuizStarted(true);
    setQuizFinished(false);
  };

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(45);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setSelectedAnswers({});
    setCurrentIndex(0);
  };

  // Computations
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

  const readinessDetails = useMemo(() => {
    if (scorePercentage >= 80) {
      return {
        level: "Highly Prepared",
        color: "bg-emerald-100 border-emerald-400 text-emerald-800",
        icon: <CheckCircle2 className="h-10 w-10 text-emerald-600" />,
        text: "Exceptional! Your aptitude score demonstrates absolute core readiness to excel in complex scholarship grants like DOST-SEI or CHED Merit."
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
        color: "bg-accent-rose/70 border-red-300 text-red-900",
        icon: <AlertTriangle className="h-10 w-10 text-red-600" />,
        text: "Don't worry! This is a roadmap indicator. Focus on targeted study modules to strengthen your primary vocabulary, mathematical formulas, and scientific facts."
      };
    }
  }, [scorePercentage]);

  const topicRecommendations = useMemo(() => {
    const list: string[] = [];
    const subjectsIncluded = new Set(activeQuestions.map((q) => q.subject));

    if (subjectsIncluded.has("Mathematics")) {
      list.push("Math: Deepen understanding of limits, calculus derivatives, and algebraic quadratics.");
    }
    if (subjectsIncluded.has("Science")) {
      list.push("Science: Memorize fundamental chemical formulas (NaCl, etc.) and Newton's three laws of motion.");
    }
    if (subjectsIncluded.has("English")) {
      list.push("English: Refresh sentence prepositions, subject-verb rules, and stylistic personification.");
    }
    if (subjectsIncluded.has("Filipino")) {
      list.push("Filipino: Re-evaluate correct application of 'ng' vs 'nang' and basic baybay rules.");
    }
    return list;
  }, [activeQuestions]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 font-sans">
      {/* 1. Setup Configuration Layer */}
      {!quizStarted && (
        <section className="bg-base-pastel border-2 border-accent-muted/60 rounded-2xl p-8 shadow-xl animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-text-primary tracking-tight">Interactive Readiness Check</h2>
            <p className="text-sm text-zinc-600 mt-2">
              Gamified timed mock-assessment to map your academic strengths before applying for grants.
            </p>
          </div>

          <div className="space-y-6">
            {/* Subject Checkboxes */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-text-primary block">
                Select Assessment Subjects (Select at least one):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Mathematics", "Science", "English", "Filipino"].map((subj) => {
                  const isChecked = selectedSubjects.includes(subj);
                  return (
                    <button
                      key={subj}
                      onClick={() => handleSubjectChange(subj)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isChecked
                        ? "bg-primary border-primary-hover text-white shadow-sm"
                          : "bg-white border-accent-periwinkle/60 text-zinc-500 hover:border-accent-periwinkle"
                      }`}
                    >
                      {subj}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider for Question Count */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-text-primary">
                  Number of Items:
                </label>
                <span className="text-xs bg-white px-2.5 py-1 rounded-full border border-accent-periwinkle font-black text-text-primary">
                  {itemCount} Questions
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                step="5"
                value={itemCount}
                onChange={(e) => setItemCount(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer accent-primary border border-accent-periwinkle"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-bold px-1">
                <span>5 Items</span>
                <span>10 Items</span>
                <span>15 Items</span>
                <span>20 Items</span>
              </div>
            </div>

            {/* Difficulty Tier */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-text-primary">
                  Difficulty Tier (1-5):
                </label>
                <span className="text-xs bg-white px-2.5 py-1 rounded-full border border-accent-periwinkle font-black text-text-primary">
                  Level {selectedDifficulty}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 bg-white p-1 rounded-xl border border-accent-periwinkle">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedDifficulty(lvl)}
                    className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      selectedDifficulty === lvl
                        ? "bg-primary text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-700"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <button
              onClick={handleStartQuiz}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold border-2 border-accent-muted shadow-md cursor-pointer transition-transform hover:scale-[1.01]"
            >
              <Play className="h-5 w-5" /> Start Assessment
            </button>
          </div>
        </section>
      )}

      {/* 2. Active Quiz Board */}
      {quizStarted && !quizFinished && activeQuestions.length > 0 && (
        <section className="bg-white border-2 border-accent-muted/40 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          {/* Header Progress and Timer */}
          <div className="bg-base-pastel px-6 py-4 flex items-center justify-between border-b border-accent-periwinkle">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Question {currentIndex + 1} of {activeQuestions.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white border border-accent-periwinkle/80 px-2 py-0.5 rounded-full font-bold text-text-primary">
                  {activeQuestions[currentIndex].subject}
                </span>
                <span className="text-[10px] text-zinc-500">
                  Difficulty Level {activeQuestions[currentIndex].difficulty}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-accent-periwinkle">
              <Timer className={`h-4 w-4 ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-text-primary"}`} />
              <span className={`text-sm font-black ${timeLeft < 10 ? "text-red-500" : "text-text-primary"}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Time Bar indicator */}
          <div className="w-full bg-zinc-100 h-1">
            <div
              className={`h-full transition-all duration-1000 ${timeLeft < 10 ? "bg-red-500" : "bg-primary-hover"}`}
              style={{ width: `${(timeLeft / 45) * 100}%` }}
            />
          </div>

          {/* Main Question Body */}
          <div className="p-8">
            <h3 className="text-lg font-bold text-text-primary mb-6 leading-relaxed">
              {activeQuestions[currentIndex].questionText}
            </h3>

            {/* Options grid */}
            <div className="space-y-3">
              {activeQuestions[currentIndex].options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentIndex] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-base-pastel border-accent-muted text-text-primary font-bold shadow-sm"
                        : "bg-white border-zinc-200 text-zinc-700 hover:border-accent-periwinkle hover:bg-base-light/10"
                    }`}
                  >
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center border text-xs font-bold ${
                      isSelected
                        ? "bg-primary border-primary-hover text-white"
                        : "border-zinc-300 bg-zinc-50 text-zinc-500"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="bg-zinc-50 border-t border-zinc-100 px-8 py-4 flex justify-between items-center">
            <p className="text-[11px] text-zinc-400">
              * Click an option above to select. Time resets each item.
            </p>
            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswers[currentIndex] === undefined}
              className="flex items-center gap-1.5 bg-primary disabled:bg-zinc-200 disabled:text-zinc-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold border border-accent-muted shadow-sm hover:bg-primary-hover transition-colors cursor-pointer"
            >
              {currentIndex < activeQuestions.length - 1 ? (
                <>Next Item <ChevronRight className="h-4 w-4" /></>
              ) : (
                "Finish Assessment"
              )}
            </button>
          </div>
        </section>
      )}

      {/* 3. Evaluation and Score Results Modal */}
      {quizFinished && (
        <section className="bg-white border-2 border-accent-muted/40 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          {/* Top banner */}
          <div className="bg-base-pastel p-8 border-b border-accent-periwinkle text-center">
            <div className="inline-flex p-4 bg-white rounded-full shadow-md border-2 border-accent-periwinkle mb-4">
              <Award className="h-12 w-12 text-primary-hover animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight">Assessment Completed</h2>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">
              Tanglaw Competency Evaluator
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Score circle / level */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="text-center p-6 bg-base-light/35 border border-accent-periwinkle rounded-2xl">
                <span className="text-xs font-bold text-zinc-500 block uppercase mb-1">Your Score</span>
                <span className="text-4xl font-black text-text-primary">
                  {score} <span className="text-lg text-zinc-500 font-normal">/ {activeQuestions.length}</span>
                </span>
                <span className="block text-xs text-zinc-600 font-semibold mt-1">
                  ({scorePercentage}% accuracy)
                </span>
              </div>

              <div className="md:col-span-2 p-6 rounded-2xl border-2 flex gap-4 items-start bg-zinc-50">
                <div className="mt-1 flex-shrink-0">
                  {readinessDetails.icon}
                </div>
                <div>
                  <h4 className="font-black text-sm text-text-primary">
                    Readiness Level: <span className="underline decoration-accent-muted underline-offset-2">{readinessDetails.level}</span>
                  </h4>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                    {readinessDetails.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations segment */}
            <div className="bg-base-pastel/50 border border-accent-periwinkle rounded-2xl p-6">
              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-1.5">
                <BookMarked className="h-4 w-4" /> Targeted Study Recommendations:
              </h3>
              <ul className="text-xs text-zinc-700 space-y-2">
                {topicRecommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent-rose mt-1 flex-shrink-0"></span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <button
              onClick={handleRestart}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold border-2 border-accent-muted shadow-md cursor-pointer transition-transform hover:scale-[1.01]"
            >
              <RotateCcw className="h-4 w-4" /> Start New Assessment
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
