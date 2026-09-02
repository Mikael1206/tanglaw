"use client";

import React from "react";
import { Search, SlidersHorizontal, DollarSign, Building2, BookOpen, ChevronUp, ChevronDown } from "lucide-react";

interface ScholarshipFilterPanelProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  incomeLimit: string;
  onIncomeChange: (value: string) => void;
  scholarshipType: string;
  onTypeChange: (value: string) => void;
  programType: string;
  onProgramChange: (value: string) => void;
  showMobileFilters: boolean;
  onToggleMobile: () => void;
  onReset: () => void;
}

export default function ScholarshipFilterPanel({
  searchTerm,
  onSearchChange,
  incomeLimit,
  onIncomeChange,
  scholarshipType,
  onTypeChange,
  programType,
  onProgramChange,
  showMobileFilters,
  onToggleMobile,
  onReset,
}: ScholarshipFilterPanelProps) {
  return (
    <aside className="w-full lg:w-80 flex-shrink-0 bg-[color:var(--theme-surface)]/80 rounded-[2rem] p-4 sm:p-5 lg:p-6 border-2 border-accent-muted shadow-lg h-fit lg:sticky lg:top-24">
      {/* Mobile filter toggle button */}
      <button
        onClick={onToggleMobile}
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
          onClick={onReset}
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
            onChange={(e) => onSearchChange(e.target.value)}
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
            onChange={(e) => onIncomeChange(e.target.value)}
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
                onClick={() => onTypeChange(t)}
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
                  onChange={() => onProgramChange(p.value)}
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
          onClick={onReset}
          className="w-full text-xs font-semibold text-[color:var(--theme-text-body)] hover:text-[color:var(--theme-typography-main)] transition-colors cursor-pointer hover:underline py-2"
        >
          Clear All Filters
        </button>
      </div>
    </aside>
  );
}
