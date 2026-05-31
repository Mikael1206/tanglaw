"use client";

/**
 * Global site header shown on public pages.
 * Hides itself when the user is inside dashboard routes.
 */
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeChanger from "@/components/theme-changer";

export default function SiteHeader() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return null;
  }

  return (
    <header className="w-full border-b border-white/10 bg-[color:var(--theme-component-backdrop)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full border border-white/10 bg-[color:var(--theme-surface)] shadow-lg shadow-black/20 flex items-center justify-center">
            <Image
              src="/assets/owel-head.png"
              alt="Owel Logo Avatar"
              width={38}
              height={38}
              className="object-cover"
            />
          </div>
          <span className="font-display text-xl font-black tracking-[0.12em] text-[color:var(--theme-typography-main)]">
            TANGLAW
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">
          <Link href="/" className="transition hover:text-[color:var(--theme-typography-main)]">
            Home
          </Link>
          <Link href="/about" className="transition hover:text-[color:var(--theme-typography-main)]">
            About
          </Link>
          <Link href="/contact" className="transition hover:text-[color:var(--theme-typography-main)]">
            Contact
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/10 bg-[color:var(--theme-surface)]/70 px-4 py-2 transition hover:bg-[color:var(--theme-surface)]"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-primary/20 bg-primary/75 px-4 py-2 text-white transition hover:bg-primary-hover"
          >
            Sign Up
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeChanger />
        </div>
      </div>
    </header>
  );
}
