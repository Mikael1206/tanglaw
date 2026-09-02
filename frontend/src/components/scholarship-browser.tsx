"use client";

/**
 * Scholarship discovery component used in the authenticated dashboard.
 * Supports keyword search, program filtering, income constraints, and scholarship listings.
 */
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Filter, ArrowUp } from "lucide-react";
import ScholarshipFilterPanel from "./scholarship-filter-panel";
import ScholarshipCard from "./scholarship-card";
import ScholarshipPagination from "./scholarship-pagination";
import { OSFA_SCHOLARSHIPS, type ScholarshipOpportunity } from "@/data/scholarships-data";
import { fetchScholarships as fetchBackendScholarships } from "@/lib/backend";
import type { BackendScholarship } from "@/lib/backend";

// Module-scoped cache — prevents re-fetching on re-renders
let cachedScholarships: ScholarshipOpportunity[] | null = null;

function inferStrand(programs: string[]): string {
  if (programs.length === 0 || (programs.length === 1 && programs[0].toLowerCase() === "any")) return "Any";
  const joined = programs.join(" ").toLowerCase();

  if (programs.some((p) => /all strand|all programs|all ched|open to all|any/i.test(p))) return "All Strand";
  if (
    joined.includes("computer") || joined.includes("engineering") || joined.includes("science") ||
    joined.includes("math") || joined.includes("technology") || joined.includes("it ") ||
    joined.includes("architecture") || joined.includes("statistics") || joined.includes("physics") ||
    joined.includes("chemistry") || joined.includes("biology")
  ) return "STEM";
  if (
    joined.includes("journalism") || joined.includes("education") || joined.includes("communication") ||
    joined.includes("arts") || joined.includes("history") || joined.includes("philosophy") ||
    joined.includes("literature") || joined.includes("broadcasting") || joined.includes("social work")
  ) return "Humanities";
  if (
    joined.includes("nursing") || joined.includes("medical") || joined.includes("health") ||
    joined.includes("pharmacy") || joined.includes("radiology") || joined.includes("therapy") ||
    joined.includes("medtech")
  ) return "Medical Allied";
  if (
    joined.includes("tourism") || joined.includes("hospitality") || joined.includes("hotel")
  ) return "Tourism & Hospitality";
  if (
    joined.includes("accountancy") || joined.includes("accounting") || joined.includes("business") ||
    joined.includes("management") || joined.includes("finance")
  ) return "Business & Accountancy";

  return programs[0];
}

function mapBackendScholarshipToOpportunity(item: BackendScholarship): ScholarshipOpportunity {
  const requirements = Array.isArray(item.requirements) ? item.requirements : [];
  const benefits = Array.isArray(item.benefits) ? item.benefits : [];
  const priorityPrograms = item.programCategories?.length ? item.programCategories : ["Open to all programs"];

  return {
    name: item.name,
    provider: item.provider,
    coverageType: benefits[0] ?? "Scholarship support",
    classification: item.type,
    strand: inferStrand(item.programCategories),
    overview: (() => {
      const programSummary = item.programCategories?.length
        ? item.programCategories.length <= 3
          ? item.programCategories.join(", ")
          : `${item.programCategories.slice(0, 3).join(", ")} and ${item.programCategories.length - 3} more`
        : "qualified students";
      return `${item.provider} offers ${item.name}. This scholarship is designed for ${programSummary} and provides ${benefits[0]?.toLowerCase() || "education support"}.`;
    })(),
    coverageDetails: benefits.join(" • ") || "Financial assistance and related learning support.",
    eligibility: {
      financialStatus: item.incomeBracket > 0
        ? `Annual household income must not exceed ₱${item.incomeBracket.toLocaleString()}`
        : "No strict income cap listed.",
      minimumGPA: item.minGwa > 1.3
        ? (item.minGwa >= 75 ? `${item.minGwa}%` : `${item.minGwa.toFixed(2)}`)
        : undefined,
      // academicStatus removed — priorityPrograms already lists all eligible programs accurately
    },
    priorityPrograms,
    requirements,
    examInformation: { type: "Application Review" },
    deadline: "Subject to provider deadline",
    links: item.link ? [item.link] : [],
  };
}

// Merge backend DB results with hardcoded OSFA scholarships.
// Backend entries take priority; static OSFA entries fill any gaps.
function mergeWithOsfa(backend: ScholarshipOpportunity[]): ScholarshipOpportunity[] {
  const map = new Map<string, ScholarshipOpportunity>();
  for (const item of backend) {
    map.set(item.name, item);
  }
  for (const item of OSFA_SCHOLARSHIPS) {
    if (!map.has(item.name)) {
      map.set(item.name, item);
    }
  }
  return Array.from(map.values());
}

async function loadScholarships(): Promise<ScholarshipOpportunity[]> {
  if (cachedScholarships) return cachedScholarships;

  const backendData = await fetchBackendScholarships();
  const merged = mergeWithOsfa(backendData.map(mapBackendScholarshipToOpportunity));
  cachedScholarships = merged;
  return cachedScholarships;
}

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
  const [scholarships, setScholarships] = useState<ScholarshipOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
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

  // Lazy-load scholarship data on mount
  useEffect(() => {
    let cancelled = false;
    loadScholarships()
      .then(data => {
        if (!cancelled) {
          setScholarships(data);
          setLoadError(null);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[ScholarshipBrowser] Failed to load scholarships:", message);
          setLoadError(
            err instanceof TypeError
              ? "We couldn't connect to the server. It may be waking up from sleep — please try again in a moment."
              : `We couldn't load scholarships: ${message}`
          );
          setIsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  // Track scroll position for "back to top" FAB on mobile
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounced search term to avoid filtering on every keystroke
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleIncomeChange = useCallback((value: string) => {
    setIncomeLimit(value);
    setCurrentPage(1);
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setScholarshipType(value);
    setCurrentPage(1);
  }, []);

  const handleProgramChange = useCallback((value: string) => {
    setProgramType(value);
    setCurrentPage(1);
  }, []);

  const filteredScholarships = useMemo(() => {
    return scholarships.filter((item) => {
      // 1. Text Search (using debounced term)
      const matchesSearch =
        item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.provider.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.overview.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.priorityPrograms.some((p) => p.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

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
  }, [debouncedSearchTerm, incomeLimit, scholarshipType, programType, scholarships]);

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

  const toggleCard = useCallback((name: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 animate-fade-in font-sans overflow-x-hidden">
      {/* Sidebar Panel for Filters */}
      <ScholarshipFilterPanel
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        incomeLimit={incomeLimit}
        onIncomeChange={handleIncomeChange}
        scholarshipType={scholarshipType}
        onTypeChange={handleTypeChange}
        programType={programType}
        onProgramChange={handleProgramChange}
        showMobileFilters={showMobileFilters}
        onToggleMobile={() => setShowMobileFilters((prev) => !prev)}
        onReset={handleResetFilters}
      />

      {/* Main Display Grid */}
      <main className="flex-1 space-y-6">
        {/* Statistics Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[color:var(--theme-surface)] border border-accent-periwinkle rounded-[2rem] px-4 sm:px-6 py-4 shadow-sm gap-3">
          <div className="text-xs sm:text-sm font-semibold text-[color:var(--theme-text-body)] break-words max-w-full">
            Showing <span className="text-text-primary font-bold">{isLoading ? "..." : filteredScholarships.length}</span> matching opportunities
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded bg-accent-periwinkle/30 border border-accent-periwinkle text-text-primary font-bold whitespace-nowrap">Pastel Palette Active</span>
            <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded bg-accent-rose/50 border border-accent-rose text-[color:var(--theme-text-body)] font-bold whitespace-nowrap">AI Matched</span>
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-[color:var(--theme-surface)]/80 border-2 border-accent-muted/40 rounded-[2rem] p-6 h-64 animate-pulse" />
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center bg-[color:var(--theme-surface)] border border-accent-rose/30 rounded-[2rem] p-8 sm:p-16 text-center shadow-sm max-w-full">
            <div className="h-12 w-12 rounded-full bg-accent-rose/20 flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="font-bold text-base sm:text-lg text-text-primary mb-2">Failed to Load Scholarships</h3>
            <p className="text-xs sm:text-sm text-[color:var(--theme-text-muted)] max-w-xs sm:max-w-sm mb-6">
              {loadError}
            </p>
            <button
              onClick={() => {
                setLoadError(null);
                setIsLoading(true);
                cachedScholarships = null;
                loadScholarships()
                  .then(data => {
                    setScholarships(data);
                    setLoadError(null);
                    setIsLoading(false);
                  })
                  .catch(err => {
                    const message = err instanceof Error ? err.message : String(err);
                    console.error("[ScholarshipBrowser] Retry failed:", message);
                    setLoadError(
                      err instanceof TypeError
                        ? "We couldn't connect to the server. It may be waking up from sleep — please try again in a moment."
                        : `We couldn't load scholarships: ${message}`
                    );
                    setIsLoading(false);
                  });
              }}
              className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-black border border-accent-muted hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredScholarships.length > 0 ? (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
{currentScholarships.map((s) => {
              return (
                <ScholarshipCard
                  key={s.name}
                  scholarship={s}
                  isExpanded={expandedCards[s.name] || false}
                  onToggle={toggleCard}
                />
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <ScholarshipPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center bg-[color:var(--theme-surface)] border border-accent-periwinkle rounded-[2rem] p-8 sm:p-16 text-center shadow-sm max-w-full">
            <Filter className="h-10 sm:h-12 w-10 sm:w-12 text-[color:var(--theme-typography-secondary)] mb-4 animate-pulse" />
            <h3 className="font-bold text-base sm:text-lg text-text-primary mb-2">No Matching Aid Found</h3>
            <p className="text-xs sm:text-sm text-[color:var(--theme-text-muted)] max-w-xs sm:max-w-sm">
              We couldn&apos;t find any scholarships matching your active filter choices. Try clearing some attributes or adjusting family income constraints.
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
