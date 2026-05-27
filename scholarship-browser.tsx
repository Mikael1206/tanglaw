"use client";

import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ExternalLink, Filter, GraduationCap, DollarSign, Building2, BookOpen, AlertCircle } from "lucide-react";

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  type: "Public" | "Private";
  incomeBracket: number; // Max annual family income (0 means any)
  program: "STEM" | "Humanities" | "Medical-Allied" | "Any";
  benefits: string[];
  requirements: string[];
  link: string;
}

const SCHOLARSHIPS_DATA: Scholarship[] = [
  {
    id: "1",
    name: "DOST-SEI Undergraduate Scholarship",
    provider: "Department of Science and Technology",
    type: "Public",
    incomeBracket: 0, // Any
    program: "STEM",
    benefits: [
      "Full Tuition & school fees coverage (up to ₱40,000/yr)",
      "Monthly Living Allowance (₱7,000/month)",
      "Book & transportation subsidies",
      "Group health insurance"
    ],
    requirements: [
      "Natural-born Filipino citizen",
      "GWA of 85% or higher",
      "Belongs to STEM strand in high school (or top 5% of non-STEM class)",
      "Must pass the DOST-SEI exam"
    ],
    link: "https://www.sei.dost.gov.ph"
  },
  {
    id: "2",
    name: "CHED Merit Scholarship Program (CMSP)",
    provider: "Commission on Higher Education",
    type: "Public",
    incomeBracket: 400000,
    program: "Any",
    benefits: [
      "Full Tuition subsidy (up to ₱120,000/yr for private; free in SUCs)",
      "Stipend of ₱80,000 per academic year",
      "Book and study grant allowance"
    ],
    requirements: [
      "Filipino citizen",
      "Combined family income of ₱400,000 or below",
      "General Weighted Average (GWA) of 90% or above"
    ],
    link: "https://ched.gov.ph"
  },
  {
    id: "3",
    name: "SM Foundation College Scholarship",
    provider: "SM Foundation",
    type: "Private",
    incomeBracket: 250000,
    program: "STEM",
    benefits: [
      "Full Tuition & matriculation coverage",
      "Monthly living stipend",
      "Exclusive part-time job opportunities during breaks",
      "Assured placement in SM Group of Companies after graduation"
    ],
    requirements: [
      "Graduate of public high schools or SM-partner private schools",
      "Annual family income not exceeding ₱250,000",
      "General Weighted Average (GWA) of 88% or above in Grade 12"
    ],
    link: "https://www.sm-foundation.org"
  },
  {
    id: "4",
    name: "Manila City Educational Assistance",
    provider: "City Government of Manila",
    type: "Public",
    incomeBracket: 200000,
    program: "Any",
    benefits: [
      "₱5,000 educational cash aid per semester",
      "Priority in local government internship positions"
    ],
    requirements: [
      "Resident of Manila City for at least 3 years",
      "Enrolled in state colleges/universities (SUCs) or local colleges",
      "Parent must be a registered voter in Manila"
    ],
    link: "https://manila.gov.ph"
  },
  {
    id: "5",
    name: "Mega-Tech Computer Science Scholarship",
    provider: "Mega-Tech Group Philippines",
    type: "Private",
    incomeBracket: 0, // Any
    program: "STEM",
    benefits: [
      "100% Tuition & miscellaneous fees covered",
      "Tech-pack allowance (high-spec laptop and accessories)",
      "Guaranteed internship and 2-year employment contract after college"
    ],
    requirements: [
      "Incoming 1st year BSCS, BSIT, or BSCpE student",
      "Must maintain a semester GWA of 1.75 or better",
      "Active portfolio showing mini coding projects is highly prioritized"
    ],
    link: "https://megatech-grants.org"
  },
  {
    id: "6",
    name: "Health-Care Alliance Foundation Grant",
    provider: "Health-Care Alliance PH",
    type: "Private",
    incomeBracket: 300000,
    program: "Medical-Allied",
    benefits: [
      "₱35,000 financial subsidy per semester",
      "Clinical clerkship stipend and uniform allowances",
      "Free reviewer materials for board exams"
    ],
    requirements: [
      "Currently enrolled in Nursing, MedTech, or Pharmacy program",
      "Annual household income below ₱300,000",
      "Maintain a GPA of 2.25 or higher without failing grades"
    ],
    link: "https://healthcare-alliance.org"
  },
  {
    id: "7",
    name: "Humanities & Arts Excellence Fellowship",
    provider: "Cultural Center Sponsoring Board",
    type: "Private",
    incomeBracket: 0, // Any
    program: "Humanities",
    benefits: [
      "₱40,000 subsidy per school year",
      "Fully sponsored publication and thesis printing grants",
      "Free admission to writing conventions and artistic forums"
    ],
    requirements: [
      "Enrolled in Literature, Fine Arts, History, or Philosophy programs",
      "Submit a portfolio of 3 original essays or artistic drafts",
      "Recommendation letter from the Department Chair"
    ],
    link: "https://humanities-fellows.ph"
  },
  {
    id: "8",
    name: "Tulong Dunong Program (TDP-TES)",
    provider: "UniFAST & CHED",
    type: "Public",
    incomeBracket: 300000,
    program: "Any",
    benefits: [
      "₱15,000 financial assistance per school year",
      "Can be combined with local government subsidies"
    ],
    requirements: [
      "Filipino tertiary student enrolled in CHED-recognized SUCs or LUCs",
      "No other major active government educational scholarship",
      "Passing grades in all subjects"
    ],
    link: "https://unifast.deped.gov.ph"
  }
];

export default function ScholarshipBrowser() {
  const [searchTerm, setSearchTerm] = useState("");
  const [incomeLimit, setIncomeLimit] = useState<string>("all");
  const [scholarshipType, setScholarshipType] = useState<string>("all");
  const [programType, setProgramType] = useState<string>("all");

  const filteredScholarships = useMemo(() => {
    return SCHOLARSHIPS_DATA.filter((item) => {
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
  }, [searchTerm, incomeLimit, scholarshipType, programType]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setIncomeLimit("all");
    setScholarshipType("all");
    setProgramType("all");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto px-4 py-8 animate-fade-in font-sans">
      {/* Sidebar Panel for Filters */}
      <aside className="w-full lg:w-80 flex-shrink-0 bg-base-pastel rounded-2xl p-6 border-2 border-accent-muted shadow-lg h-fit sticky top-24">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-accent-muted/40">
          <div className="flex items-center gap-2 text-text-primary">
            <SlidersHorizontal className="h-5 w-5" />
            <h2 className="font-bold text-lg">Filter Controls</h2>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer hover:underline"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-6">
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
              className="w-full bg-white border border-accent-periwinkle rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent-muted text-text-primary placeholder-zinc-400"
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
              className="w-full bg-white border border-accent-periwinkle rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent-muted text-text-primary"
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
            <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-accent-periwinkle">
              {["all", "public", "private"].map((t) => (
                <button
                  key={t}
                  onClick={() => setScholarshipType(t)}
                  className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    scholarshipType === t
                      ? "bg-primary text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
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
                      : "bg-white border-accent-periwinkle/60 text-zinc-600 hover:border-accent-periwinkle"
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
      </aside>

      {/* Main Display Grid */}
      <main className="flex-1 space-y-6">
        {/* Statistics Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-accent-periwinkle rounded-2xl px-6 py-4 shadow-sm gap-3">
          <div className="text-sm font-semibold text-zinc-600">
            Showing <span className="text-text-primary font-bold">{filteredScholarships.length}</span> matching scholarships
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center px-2 py-1 rounded bg-accent-periwinkle/30 border border-accent-periwinkle text-text-primary font-bold">Pastel Palette Active</span>
            <span className="inline-flex items-center px-2 py-1 rounded bg-accent-rose/50 border border-accent-rose text-zinc-800 font-bold">AI Matched</span>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredScholarships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredScholarships.map((s) => (
              <article
                key={s.id}
                className="bg-base-pastel border-2 border-accent-muted/40 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:border-accent-muted transition-all duration-300 group hover:-translate-y-1"
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
                    <span className="text-[10px] bg-white border border-accent-periwinkle/80 text-zinc-600 font-bold px-2.5 py-0.5 rounded-full">
                      {s.program === "Any" ? "Open for All Major streams" : `${s.program} major`}
                    </span>
                    {s.incomeBracket > 0 && (
                      <span className="text-[10px] bg-accent-rose/70 border border-accent-rose text-zinc-800 font-bold px-2.5 py-0.5 rounded-full">
                        Family Income Limit: ₱{(s.incomeBracket).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Name and Sponsoring */}
                  <h3 className="font-bold text-lg text-text-primary leading-tight group-hover:text-zinc-950 mb-1">
                    {s.name}
                  </h3>
                  <p className="text-xs text-zinc-600 font-medium mb-4">
                    Sponsor: <span className="text-text-primary font-bold">{s.provider}</span>
                  </p>

                  {/* Benefits Block */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-text-primary mb-1.5 uppercase tracking-wide flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-zinc-700" /> Key Benefits:
                    </h4>
                    <ul className="text-xs text-zinc-700 space-y-1 pl-4 list-disc">
                      {s.benefits.slice(0, 3).map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                      {s.benefits.length > 3 && (
                        <li className="text-[10px] font-bold text-zinc-500 list-none mt-0.5">
                          + {s.benefits.length - 3} more financial incentives
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Requirements Block */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-text-primary mb-1.5 uppercase tracking-wide flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-zinc-700" /> Base Requirements:
                    </h4>
                    <ul className="text-xs text-zinc-600 space-y-1 pl-4 list-circle">
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
        ) : (
          <div className="flex flex-col items-center justify-center bg-white border border-accent-periwinkle rounded-2xl p-16 text-center shadow-sm">
            <Filter className="h-12 w-12 text-accent-muted mb-4 animate-pulse" />
            <h3 className="font-bold text-lg text-text-primary mb-2">No Matching Aid Found</h3>
            <p className="text-sm text-zinc-500 max-w-sm">
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
    </div>
  );
}
