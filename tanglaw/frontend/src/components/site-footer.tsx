"use client";

/**
 * Global site footer shown on public pages.
 * Hides itself when the user is inside dashboard routes to prevent
 * double footer rendering (dashboard layout has its own footer).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return null;
  }

  return (
    <footer className="bg-[color:var(--theme-component-backdrop)] border-t border-white/5 py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--theme-typography-secondary)] font-black">
            TANGLAW RESEARCH PROJECT © 2026
          </p>
          <p className="text-[10px] text-[color:var(--theme-typography-secondary)] mt-1">
            Science, Technology, and Society (BSCS 1-2)
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-[10px] text-[color:var(--theme-typography-secondary)] uppercase tracking-[0.28em] font-semibold">
          <Link href="/about" className="hover:text-[color:var(--theme-typography-main)]">
            The Minds Behind Us
          </Link>
          <span className="text-white/20">|</span>
          <a href="https://pup.edu.ph" target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--theme-typography-main)]">
            PUP Manila
          </a>
        </div>
      </div>
    </footer>
  );
}
