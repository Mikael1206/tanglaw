"use client";

import React from "react";

interface ScholarshipPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ScholarshipPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ScholarshipPaginationProps) {
  return (
    <div className="flex items-center justify-between w-full mt-8 pt-6 border-t border-accent-muted/30">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium rounded-md bg-slate-800/50 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        Previous
      </button>
      <span className="text-sm text-slate-400">
        Page <span className="font-semibold text-[color:var(--theme-typography-main)]">{currentPage}</span> of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium rounded-md bg-slate-800/50 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        Next
      </button>
    </div>
  );
}
