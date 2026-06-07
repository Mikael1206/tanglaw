"use client";

/**
 * Global site header shown on public pages.
 * Hides itself when the user is inside dashboard routes.
 */
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeChanger from "@/components/theme-changer";

export default function SiteHeader() {
  const pathname = usePathname();
  const { status } = useSession();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isAuthenticated = status === "authenticated";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  if (isDashboard) {
    return null;
  }

  return (
    <header className="relative z-50 w-full border-b border-white/10 bg-[color:var(--theme-component-backdrop)]">
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
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-black tracking-[0.12em] text-[color:var(--theme-typography-main)]">
              TANGLAW
            </span>
            <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary shadow-sm">
              Beta
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">
          <Link
            href="/"
            className={`transition px-3 py-2 rounded-full ${
              pathname === "/"
                ? "border border-primary/20 bg-primary/75 text-white"
                : "hover:text-[color:var(--theme-typography-main)]"
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`transition px-3 py-2 rounded-full ${
              pathname === "/about"
                ? "border border-primary/20 bg-primary/75 text-white"
                : "hover:text-[color:var(--theme-typography-main)]"
            }`}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`transition px-3 py-2 rounded-full ${
              pathname === "/contact"
                ? "border border-primary/20 bg-primary/75 text-white"
                : "hover:text-[color:var(--theme-typography-main)]"
            }`}
          >
            Contact
          </Link>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className={`transition px-4 py-2 rounded-full ${
                pathname?.startsWith("/dashboard")
                  ? "border border-primary/20 bg-primary/75 text-white hover:bg-primary-hover"
                  : "hover:text-[color:var(--theme-typography-main)]"
              }`}
            >
              Dashboard
            </Link>
          ) : (
            <>
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
            </>
          )}
        </nav>

        <div className="flex items-center gap-3" ref={menuRef}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-full border border-white/10 bg-[color:var(--theme-surface)]/80 hover:bg-[color:var(--theme-surface)] transition"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="h-5 w-5 text-[color:var(--theme-typography-main)]" />
            ) : (
              <Menu className="h-5 w-5 text-[color:var(--theme-typography-main)]" />
            )}
          </button>

          {/* Mobile backdrop + dropdown panel */}
          <AnimatePresence>
            {menuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-40 md:hidden bg-black/35"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden="true"
                />
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="absolute top-24 left-0 right-0 z-50 md:hidden border-b border-white/10 bg-[color:var(--theme-component-backdrop)] shadow-2xl shadow-black/30 origin-top"
                >
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-3 text-[11px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">
                  <Link
                    href="/"
                    className={`transition px-4 py-3 rounded-full ${
                      pathname === "/"
                        ? "border border-primary/20 bg-primary/75 text-white"
                        : "hover:text-[color:var(--theme-typography-main)] hover:bg-white/5"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/about"
                    className={`transition px-4 py-3 rounded-full ${
                      pathname === "/about"
                        ? "border border-primary/20 bg-primary/75 text-white"
                        : "hover:text-[color:var(--theme-typography-main)] hover:bg-white/5"
                    }`}
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className={`transition px-4 py-3 rounded-full ${
                      pathname === "/contact"
                        ? "border border-primary/20 bg-primary/75 text-white"
                        : "hover:text-[color:var(--theme-typography-main)] hover:bg-white/5"
                    }`}
                  >
                    Contact
                  </Link>
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      className={`transition px-4 py-3 rounded-full ${
                        pathname?.startsWith("/dashboard")
                          ? "border border-primary/20 bg-primary/75 text-white"
                          : "hover:text-[color:var(--theme-typography-main)] hover:bg-white/5"
                      }`}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="rounded-full border border-white/10 bg-[color:var(--theme-surface)]/70 px-4 py-3 transition hover:bg-[color:var(--theme-surface)]"
                      >
                        Log In
                      </Link>
                      <Link
                        href="/signup"
                        className="rounded-full border border-primary/20 bg-primary/75 px-4 py-3 text-white transition hover:bg-primary-hover"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </nav>
              </motion.div>
              </>
            )}
          </AnimatePresence>

          <ThemeChanger />
        </div>
      </div>
    </header>
  );
}
