"use client";

/**
 * Scholarship discovery component used in the authenticated dashboard.
 * Supports keyword search, program filtering, income constraints, and scholarship listings.
 */
import React, { useEffect, useState, useMemo } from "react";
import { Search, SlidersHorizontal, ExternalLink, Filter, GraduationCap, DollarSign, Building2, BookOpen, AlertCircle, RefreshCw, ChevronDown, ChevronUp, ArrowUp } from "lucide-react";
import { fetchScholarships } from "@/lib/backend";

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  type: "Public" | "Private";
  incomeBracket: number; // Max annual family income (0 means any)
  program: string;
  benefits: string[];
  requirements: string[];
  link: string;
}

// ── sessionStorage cache ─────────────────────────────────────────────────────
const CACHE_KEY = "tanglaw-scholarships-v1";
const CACHE_AGE_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: Scholarship[];
  timestamp: number;
}

function getCachedScholarships(): Scholarship[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_AGE_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCachedScholarships(data: Scholarship[]) {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable — ignore
  }
}

// ── Skeleton card for loading state ──────────────────────────────────────────
function ScholarshipSkeleton() {
  return (
    <div className="bg-[color:var(--theme-surface)]/80 border-2 border-accent-muted/40 rounded-2xl p-6 animate-pulse">
      <div className="flex gap-1.5 mb-3.5">
        <div className="h-4 w-16 bg-[color:var(--theme-borders-system)]/35 rounded-full" />
        <div className="h-4 w-24 bg-[color:var(--theme-borders-system)]/35 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-[color:var(--theme-borders-system)]/35 rounded mb-2" />
      <div className="h-3 w-1/2 bg-[color:var(--theme-borders-system)]/22 rounded mb-4" />
      <div className="space-y-1.5 mb-4">
        <div className="h-3 w-1/3 bg-[color:var(--theme-borders-system)]/22 rounded" />
        <div className="h-3 w-full bg-[color:var(--theme-borders-system)]/22 rounded" />
        <div className="h-3 w-5/6 bg-[color:var(--theme-borders-system)]/22 rounded" />
      </div>
      <div className="h-10 w-full bg-[color:var(--theme-borders-system)]/35 rounded-xl" />
    </div>
  );
}

export default function ScholarshipBrowser() {
  const [scholarships, setScholarships] = useState<Scholarship[]>(() => getCachedScholarships() ?? []);
  const [loadingScholarships, setLoadingScholarships] = useState(() => getCachedScholarships() === null);
  const [scholarshipError, setScholarshipError] = useState<string | null>(null);

  useEffect(() => {
    // Skip fetch if we already have cached data
    if (!loadingScholarships) return;

    let active = true;

    async function loadScholarships() {
      try {
        const backendScholarships = await fetchScholarships();
        if (!active) return;
        setScholarships(backendScholarships);
        setCachedScholarships(backendScholarships);
      } catch (error) {
        console.error("Failed to load scholarships from backend:", error);
        if (active) {
          setScholarshipError(error instanceof Error ? error.message : String(error));
        }
      } finally {
        if (active) {
          setLoadingScholarships(false);
        }
      }
    }

    loadScholarships();
    return () => {
      active = false;
    };
  }, [loadingScholarships]);

  const [searchTerm, setSearchTerm] = useState("");
  const [incomeLimit, setIncomeLimit] = useState<string>("all");
  const [scholarshipType, setScholarshipType] = useState<string>("all");
  const [programType, setProgramType] = useState<string>("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Track scroll position for "back to top" FAB on mobile
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredScholarships = useMemo(() => {
    return scholarships.filter((item) => {
      // 1. Text Search
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.benefits.some((b) => b.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Income Bracket filter
      let matchesIncome = true;
      if (incomeLimit !== "all") {
        const limitNum = parseInt(incomeLimit, 10);
        // If scholarship is any income (0), or its income bracket limit is >= user choice
        matchesIncome = item.incomeBracket === 0 || item.incomeBracket <= limitNum;
      }

      // 3. Scholarship Type (Public/Private)
      const matchesType =
        scholarshipType === "all" || item.type.toLowerCase() === scholarshipType.toLowerCase();

      // 4. Program Type
      const matchesProgram =
        programType === "all" ||
        item.program === "Any" ||
        item.program.toLowerCase() === programType.toLowerCase();

      return matchesSearch && matchesIncome && matchesType && matchesProgram;
    });
  }, [searchTerm, incomeLimit, scholarshipType, programType, scholarships]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setIncomeLimit("all");
    setScholarshipType("all");
    setProgramType("all");
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetry = () => {
    setScholarshipError(null);
    setLoadingScholarships(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto px-4 py-8 animate-fade-in font-sans">
      {/* Sidebar Panel for Filters */}
      <aside className="w-full lg:w-80 flex-shrink-0 bg-[color:var(--theme-surface)]/80 rounded-2xl p-4 sm:p-6 border-2 border-accent-muted shadow-lg h-fit lg:sticky lg:top-24">
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
              placeholder="Search DOST, CHED, benefits..."
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
              <option value="300000">₱300,000 or below</option>
              <option value="250000">₱250,000 or below</option>
              <option value="200000">₱200,000 or below</option>
            </select>
          </div>

          {/* Public vs Private */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Building2 className="h-4 w-4" /> Scholarship Sponsoring
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
        <div className="flex flex-col sm:flex-row justify-between items-center bg-[color:var(--theme-surface)] border border-accent-periwinkle rounded-2xl px-6 py-4 shadow-sm gap-3">
          <div className="text-sm font-semibold text-[color:var(--theme-text-body)]">
            {loadingScholarships ? (
              "Loading scholarships..."
            ) : scholarshipError ? (
              <span className="text-red-600">Failed to load — server may be starting up</span>
            ) : (
              <>
                Showing <span className="text-text-primary font-bold">{filteredScholarships.length}</span> matching scholarships
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center px-2 py-1 rounded bg-accent-periwinkle/30 border border-accent-periwinkle text-text-primary font-bold">Pastel Palette Active</span>
            <span className="inline-flex items-center px-2 py-1 rounded bg-accent-rose/50 border border-accent-rose text-[color:var(--theme-text-body)] font-bold">AI Matched</span>
          </div>
        </div>

        {/* Error State */}
        {scholarshipError && (
          <div className="flex flex-col items-center justify-center bg-[color:var(--theme-surface)] border border-red-200 rounded-2xl p-12 text-center shadow-sm">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="font-bold text-lg text-text-primary mb-2">Could Not Load Scholarships</h3>
            <p className="text-sm text-[color:var(--theme-text-muted)] max-w-md mb-1">
              The backend server may be waking up from sleep (free-tier cold start can take 30–60 seconds).
            </p>
            <p className="text-xs text-[color:var(--theme-text-muted)] max-w-md mb-6">
              Error: {scholarshipError}
            </p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold border border-accent-muted hover:bg-primary-hover transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loadingScholarships && !scholarshipError && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <ScholarshipSkeleton key={n} />
            ))}
          </div>
        )}

        {/* Listings Grid */}
        {!loadingScholarships && !scholarshipError && filteredScholarships.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredScholarships.map((s) => (
              <article
                key={s.id}
                className="bg-[color:var(--theme-surface)]/80 border-2 border-accent-muted/40 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:border-accent-muted transition-all duration-300 group hover:-translate-y-1"
              >
                <div>
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                    <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${
                      s.type === "Public"
                        ? "bg-accent-periwinkle/65 border-accent-muted text-text-primary"
                        : "bg-primary/50 border-primary-hover text-text-primary"
                    }`}>
                      {s.type}
                    </span>
                    <span className="text-[10px] bg-[color:var(--theme-canvas)] border border-accent-periwinkle/80 text-[color:var(--theme-text-body)] font-bold px-2.5 py-0.5 rounded-full">
                      {s.program === "Any" ? "Open for All Major streams" : `${s.program} major`}
                    </span>
                    {s.incomeBracket > 0 && (
                      <span className="text-[10px] bg-accent-rose/70 border border-accent-rose text-[color:var(--theme-text-body)] font-bold px-2.5 py-0.5 rounded-full">
                        Family Income Limit: ₱{s.incomeBracket.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Name and Sponsoring */}
                  <h3 className="font-bold text-lg text-text-primary leading-tight group-hover:text-[color:var(--theme-typography-main)] mb-1">
                    {s.name}
                  </h3>
                  <p className="text-xs text-[color:var(--theme-text-body)] font-medium mb-4">
                    Sponsor: <span className="text-text-primary font-bold">{s.provider}</span>
                  </p>

                  {/* Benefits Block */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-text-primary mb-1.5 uppercase tracking-wide flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-[color:var(--theme-text-body)]" /> Key Benefits:
                    </h4>
                    <ul className="text-xs text-[color:var(--theme-text-body)] space-y-1 pl-4 list-disc">
                      {s.benefits.slice(0, 3).map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                      {s.benefits.length > 3 && (
                        <li className="text-[10px] font-bold text-[color:var(--theme-text-muted)] list-none mt-0.5">
                          + {s.benefits.length - 3} more financial incentives
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Requirements Block */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-text-primary mb-1.5 uppercase tracking-wide flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-[color:var(--theme-text-body)]" /> Base Requirements:
                    </h4>
                    <ul className="text-xs text-[color:var(--theme-text-body)] space-y-1 pl-4 list-circle">
                      {s.requirements.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Apply Button */}
                <a
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-xs font-bold border border-accent-muted shadow-sm hover:bg-primary-hover transition-colors focus:outline-none cursor-pointer text-center"
                >
                  Apply Directly <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </article>
            ))}
          </div>
        )}

        {/* Empty State (no filters match, but data is loaded) */}
        {!loadingScholarships && !scholarshipError && filteredScholarships.length === 0 && (
          <div className="flex flex-col items-center justify-center bg-[color:var(--theme-surface)] border border-accent-periwinkle rounded-2xl p-16 text-center shadow-sm">
            <Filter className="h-12 w-12 text-[color:var(--theme-typography-secondary)] mb-4 animate-pulse" />
            <h3 className="font-bold text-lg text-text-primary mb-2">No Matching Aid Found</h3>
            <p className="text-sm text-[color:var(--theme-text-muted)] max-w-sm">
              We couldn't find any scholarships matching your active filter choices. Try clearing some attributes or adjusting family income constraints.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold border border-accent-muted hover:bg-primary-hover transition-colors cursor-pointer"
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
