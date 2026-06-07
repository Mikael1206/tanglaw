"use client";

/**
 * Scholarship discovery component used in the authenticated dashboard.
 * Supports keyword search, program filtering, income constraints, and scholarship listings.
 */
import React, { useEffect, useState, useMemo } from "react";
import { Search, SlidersHorizontal, ExternalLink, Filter, GraduationCap, DollarSign, Building2, BookOpen, AlertCircle, ChevronDown, ChevronUp, ArrowUp, Calendar, FileText, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SCHOLARSHIPS_DATA, ScholarshipOpportunity } from "@/data/scholarships-data";

// Helper to extract numeric limit from financial text to support income filtering
function getNumericIncomeLimit(statusText?: string): number {
  if (!statusText) return 0;
  const cleanText = statusText.toLowerCase();
  
  // Look for monthly values first
  if (cleanText.includes("30,000 monthly") || cleanText.includes("30,000/month")) return 360000;
  
  // Annual values
  if (cleanText.includes("400,000") || cleanText.includes("400.000")) return 400000;
  if (cleanText.includes("350,000")) return 350000;
  if (cleanText.includes("300,000") || cleanText.includes("300.000")) return 300000;
  if (cleanText.includes("250,000")) return 250000;
  if (cleanText.includes("180,000")) return 180000;
  
  // Other currencies / special thresholds
  if (cleanText.includes("usd $1000") || cleanText.includes("usd $1,000")) return 700000;
  
  return 0;
}

// Helper to filter by academic stream
function matchesAcademicStream(opportunity: ScholarshipOpportunity, filterValue: string): boolean {
  if (filterValue === "all") return true;
  
  const programs = opportunity.priorityPrograms.map(p => p.toLowerCase());
  const strand = opportunity.strand.toLowerCase();
  
  // General fallback matches
  if (
    programs.some(p => p.includes("open to all") || p.includes("all programs") || p.includes("all CHED recognized") || p.includes("tba")) || 
    strand.includes("all strand") || 
    strand.includes("tba")
  ) {
    return true;
  }

  if (filterValue === "stem") {
    return programs.some(p => 
      p.includes("computer") || p.includes("information technology") || p.includes("it") || 
      p.includes("engineering") || p.includes("science") || p.includes("math") || 
      p.includes("architecture") || p.includes("design") || p.includes("technology") || p.includes("stem")
    ) || strand.includes("stem") || strand.includes("bscs") || strand.includes("bsce") || strand.includes("engineering") || strand.includes("bsarch");
  }
  
  if (filterValue === "humanities") {
    return programs.some(p => 
      p.includes("journalism") || p.includes("education") || p.includes("broadcasting") || 
      p.includes("advertising") || p.includes("communication") || p.includes("arts") || p.includes("social work")
    ) || strand.includes("communication") || strand.includes("education");
  }
  
  if (filterValue === "medical-allied") {
    return programs.some(p => 
      p.includes("health") || p.includes("therapy") || p.includes("medical") || p.includes("radiology")
    );
  }
  
  return false;
}

export default function ScholarshipBrowser() {
  const [scholarships] = useState<ScholarshipOpportunity[]>(SCHOLARSHIPS_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [incomeLimit, setIncomeLimit] = useState<string>("all");
  const [scholarshipType, setScholarshipType] = useState<string>("all");
  const [programType, setProgramType] = useState<string>("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Tracks which card is expanded (accordion state)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Track scroll position for "back to top" FAB on mobile
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, incomeLimit, scholarshipType, programType]);

  const filteredScholarships = useMemo(() => {
    return scholarships.filter((item) => {
      // 1. Text Search
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.overview.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.priorityPrograms.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Income Bracket filter
      let matchesIncome = true;
      if (incomeLimit !== "all") {
        const limitNum = parseInt(incomeLimit, 10);
        const parsedLimit = getNumericIncomeLimit(item.eligibility.financialStatus);
        // Match if no limit (0) or if the parsed limit is within selected bound
        matchesIncome = parsedLimit === 0 || parsedLimit <= limitNum;
      }

      // 3. Scholarship Type (Public/Private mapping)
      let matchesType = true;
      if (scholarshipType !== "all") {
        const isPrivate = item.classification.toLowerCase().includes("private");
        if (scholarshipType === "private") {
          matchesType = isPrivate;
        } else if (scholarshipType === "public") {
          matchesType = !isPrivate;
        }
      }

      // 4. Program Type (Academic Stream map)
      const matchesProgram = matchesAcademicStream(item, programType);

      return matchesSearch && matchesIncome && matchesType && matchesProgram;
    });
  }, [searchTerm, incomeLimit, scholarshipType, programType, scholarships]);

  // Pagination: slice the filtered list to the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentScholarships = filteredScholarships.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredScholarships.length / itemsPerPage);

  const handleResetFilters = () => {
    setSearchTerm("");
    setIncomeLimit("all");
    setScholarshipType("all");
    setProgramType("all");
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCard = (name: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 animate-fade-in font-sans overflow-x-hidden">
      {/* Sidebar Panel for Filters */}
      <aside className="w-full lg:w-80 flex-shrink-0 bg-[color:var(--theme-surface)]/80 rounded-[2rem] p-4 sm:p-5 lg:p-6 border-2 border-accent-muted shadow-lg h-fit lg:sticky lg:top-24">
        {/* Mobile filter toggle button */}
        <button
          onClick={() => setShowMobileFilters((prev) => !prev)}
          className="lg:hidden flex items-center justify-between w-full mb-4 pb-3 border-b border-accent-muted/40 text-text-primary"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            <h2 className="font-bold text-lg">Filter Controls</h2>
          </div>
          {showMobileFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b border-accent-muted/40">
          <div className="flex items-center gap-2 text-text-primary">
            <SlidersHorizontal className="h-5 w-5" />
            <h2 className="font-bold text-lg">Filter Controls</h2>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-[color:var(--theme-text-body)] hover:text-[color:var(--theme-typography-main)] transition-colors cursor-pointer hover:underline"
          >
            Clear All
          </button>
        </div>

        {/* Filter body — collapsible on mobile, always visible on desktop */}
        <div className={`space-y-6 ${showMobileFilters ? "block" : "hidden lg:block"}`}>
          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Search className="h-4 w-4" /> Keyword Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search DOST, Megaworld, criteria..."
              className="w-full bg-[color:var(--theme-surface)] border border-accent-periwinkle rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent-muted text-text-primary placeholder-zinc-400"
            />
          </div>

          {/* Income Bracket */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" /> Max Family Income
            </label>
            <select
              value={incomeLimit}
              onChange={(e) => setIncomeLimit(e.target.value)}
              className="w-full bg-[color:var(--theme-surface)] border border-accent-periwinkle rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent-muted text-text-primary"
            >
              <option value="all">Any Income Bracket</option>
              <option value="400000">₱400,000 or below</option>
              <option value="350000">₱350,000 or below</option>
              <option value="300000">₱300,000 or below</option>
              <option value="250000">₱250,000 or below</option>
              <option value="180000">₱180,000 or below</option>
            </select>
          </div>

          {/* Public vs Private */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Building2 className="h-4 w-4" /> Sponsoring Type
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[color:var(--theme-surface)] p-1 rounded-xl border border-accent-periwinkle">
              {["all", "public", "private"].map((t) => (
                <button
                  key={t}
                  onClick={() => setScholarshipType(t)}
                  className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    scholarshipType === t
                      ? "bg-primary text-white shadow-sm"
                      : "text-[color:var(--theme-text-muted)] hover:text-[color:var(--theme-text-body)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Program Type */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" /> Academic Stream
            </label>
            <div className="flex flex-col gap-2">
              {[
                { value: "all", label: "All Programs / Any" },
                { value: "stem", label: "STEM Courses" },
                { value: "humanities", label: "Humanities / Arts" },
                { value: "medical-allied", label: "Medical-Allied" }
              ].map((p) => (
                <label
                  key={p.value}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
                    programType === p.value
                      ? "bg-primary/20 border-primary text-text-primary"
                      : "bg-[color:var(--theme-surface)] border-accent-periwinkle/60 text-[color:var(--theme-text-body)] hover:border-accent-periwinkle"
                  }`}
                >
                  <input
                    type="radio"
                    name="program"
                    value={p.value}
                    checked={programType === p.value}
                    onChange={() => setProgramType(p.value)}
                    className="accent-primary h-4 w-4 cursor-pointer"
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile clear button */}
        <div className={`mt-4 lg:hidden ${showMobileFilters ? "block" : "hidden"}`}>
          <button
            onClick={handleResetFilters}
            className="w-full text-xs font-semibold text-[color:var(--theme-text-body)] hover:text-[color:var(--theme-typography-main)] transition-colors cursor-pointer hover:underline py-2"
          >
            Clear All Filters
          </button>
        </div>
      </aside>

      {/* Main Display Grid */}
      <main className="flex-1 space-y-6">
        {/* Statistics Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[color:var(--theme-surface)] border border-accent-periwinkle rounded-[2rem] px-4 sm:px-6 py-4 shadow-sm gap-3">
          <div className="text-xs sm:text-sm font-semibold text-[color:var(--theme-text-body)] break-words max-w-full">
            Showing <span className="text-text-primary font-bold">{filteredScholarships.length}</span> matching opportunities
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded bg-accent-periwinkle/30 border border-accent-periwinkle text-text-primary font-bold whitespace-nowrap">Pastel Palette Active</span>
            <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded bg-accent-rose/50 border border-accent-rose text-[color:var(--theme-text-body)] font-bold whitespace-nowrap">AI Matched</span>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredScholarships.length > 0 ? (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
{currentScholarships.map((s) => {
              const isPrivate = s.classification.toLowerCase().includes("private");
              const isExpanded = expandedCards[s.name] || false;
              const limitDisplay = getNumericIncomeLimit(s.eligibility.financialStatus);
              const nameSlug = s.name.replace(/\s+/g, "-");

              return (
                <article
                  key={s.name}
                  className="bg-[color:var(--theme-surface)]/80 border-2 border-accent-muted/40 rounded-[2rem] p-4 sm:p-6 flex flex-col transition-all duration-300 group hover:shadow-xl hover:border-accent-muted hover:-translate-y-1"
                >
                  {/* ── Always Visible Section ── */}
                  <div className="space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${
                        !isPrivate
                          ? "bg-accent-periwinkle/65 border-accent-muted text-text-primary"
                          : "bg-primary/10 border-primary/20 text-primary"
                      }`}>
                        {s.classification}
                      </span>
                      <span className="text-[10px] bg-[color:var(--theme-canvas)] border border-accent-periwinkle/80 text-[color:var(--theme-text-body)] font-black px-2.5 py-0.5 rounded-full">
                        {s.strand}
                      </span>
                      {limitDisplay > 0 && (
                        <span className="text-[10px] bg-accent-rose/20 border border-accent-rose/40 text-rose-700 font-bold px-2.5 py-0.5 rounded-full">
                          Income Max: ₱{limitDisplay.toLocaleString()}
                        </span>
                      )}
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
                    onClick={() => toggleCard(s.name)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-accent-muted/30 bg-[color:var(--theme-canvas)]/50 text-xs font-bold text-text-primary hover:bg-[color:var(--theme-canvas)] hover:border-accent-muted/60 transition-all duration-200 cursor-pointer group/toggle"
                    aria-expanded={isExpanded}
                    aria-controls={`card-body-${nameSlug}`}
                  >
                    <span className="transition-opacity duration-200">
                      {isExpanded ? "Hide Details" : "View Full Details"}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
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
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
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
                                const label = key
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
                            <ul className="text-xs text-[color:var(--theme-text-body)] space-y-1 pl-4 list-decimal">
                              {s.requirements.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
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
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between w-full mt-8 pt-6 border-t border-accent-muted/30">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium rounded-md bg-slate-800/50 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400">
                Page <span className="font-semibold text-[color:var(--theme-typography-main)]">{currentPage}</span> of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium rounded-md bg-slate-800/50 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center bg-[color:var(--theme-surface)] border border-accent-periwinkle rounded-[2rem] p-8 sm:p-16 text-center shadow-sm max-w-full">
            <Filter className="h-10 sm:h-12 w-10 sm:w-12 text-[color:var(--theme-typography-secondary)] mb-4 animate-pulse" />
            <h3 className="font-bold text-base sm:text-lg text-text-primary mb-2">No Matching Aid Found</h3>
            <p className="text-xs sm:text-sm text-[color:var(--theme-text-muted)] max-w-xs sm:max-w-sm">
              We couldn't find any scholarships matching your active filter choices. Try clearing some attributes or adjusting family income constraints.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-black border border-accent-muted hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Scroll-to-top FAB — mobile only */}
      <button
        onClick={handleScrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-20 left-4 z-30 lg:hidden flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover transition-all duration-300 focus:outline-none ${
          showScrollTop ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
