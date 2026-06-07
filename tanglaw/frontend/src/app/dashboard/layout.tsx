"use client";

/**
 * Layout wrapper for dashboard pages.
 * Applies secure guard, header navigation, and embedded chatbot UI.
 */
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LogOut, Sparkles, Menu, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import AuthGuard from "@/components/AuthGuard";
import ThemeChanger from "@/components/theme-changer";
import { EtheralShadow } from "../../../components/ui/etheral-shadow";
import OwelChatbot from "@/components/owel-chatbot";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
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

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Logout error:", error);
    }
    router.push("/login");
  };

  return (
    <AuthGuard>
      <div className="h-screen overflow-y-auto hide-scrollbar bg-base-light text-text-primary flex flex-col">
          <EtheralShadow
            animation={{ scale: 60, speed: 80 }}
            noise={{ opacity: 0.8, scale: 1.0 }}
            sizing="cover"
            lightColor="rgba(200, 230, 175, 0.85)"
          />
        <header className="relative z-50 border-b border-accent-muted/40 bg-[color:var(--theme-surface)]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-[color:var(--theme-typography-main)]">
                <Sparkles className="h-5 w-5 text-primary" />
                DASHBOARD
              </Link>
              <nav className="hidden sm:flex flex-wrap gap-3 text-[11px] uppercase font-bold tracking-widest text-[color:var(--theme-text-body)]">
                <Link href="/dashboard" className="hover:text-[color:var(--theme-typography-main)] transition-colors">Overview</Link>
                <Link href="/dashboard/scholarships" className="hover:text-[color:var(--theme-typography-main)] transition-colors">Scholarships</Link>
                <Link href="/dashboard/readiness" className="hover:text-[color:var(--theme-typography-main)] transition-colors">Readiness</Link>
              </nav>
            </div>

            <div className="flex items-center gap-3" ref={menuRef}>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="sm:hidden flex items-center justify-center h-10 w-10 rounded-full border border-accent-muted/40 bg-[color:var(--theme-surface)] hover:bg-[color:var(--theme-base-pastel)] transition"
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={menuOpen}
              >
                {menuOpen ? (
                  <X className="h-5 w-5 text-[color:var(--theme-text-body)]" />
                ) : (
                  <Menu className="h-5 w-5 text-[color:var(--theme-text-body)]" />
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
                      className="fixed inset-0 z-40 sm:hidden bg-black/35"
                      onClick={() => setMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.97 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="absolute top-full left-0 right-0 z-50 sm:hidden border-b border-accent-muted/40 bg-[color:var(--theme-surface)] shadow-2xl shadow-black/15 origin-top"
                    >
                    <nav className="max-w-7xl mx-auto px-4 py-5 flex flex-col gap-3 text-[11px] uppercase font-bold tracking-widest text-[color:var(--theme-text-body)]">
                      <Link
                        href="/dashboard"                          className={`transition px-4 py-3 rounded-full ${
                          pathname === "/dashboard"
                            ? "bg-primary/10 text-primary font-black"
                            : "hover:bg-[color:var(--theme-base-pastel)] hover:text-[color:var(--theme-typography-main)]"
                        }`}
                      >
                        Overview
                      </Link>
                      <Link
                        href="/dashboard/scholarships"
                        className={`transition px-4 py-3 rounded-full ${
                          pathname === "/dashboard/scholarships"
                            ? "bg-primary/10 text-primary font-black"
                            : "hover:bg-[color:var(--theme-base-pastel)] hover:text-[color:var(--theme-typography-main)]"
                        }`}
                      >
                        Scholarships
                      </Link>
                      <Link
                        href="/dashboard/readiness"
                        className={`transition px-4 py-3 rounded-full ${
                          pathname === "/dashboard/readiness"
                            ? "bg-primary/10 text-primary font-black"
                            : "hover:bg-[color:var(--theme-base-pastel)] hover:text-[color:var(--theme-typography-main)]"
                        }`}
                      >
                        Readiness
                      </Link>

                      <hr className="border-accent-muted/30 my-1" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center gap-2 rounded-full bg-primary text-white px-4 py-3 text-xs font-bold uppercase tracking-widest transition hover:bg-primary-hover"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </nav>
                  </motion.div>
                  </>
                )}
              </AnimatePresence>

              <ThemeChanger />
              <button
                onClick={handleSignOut}
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary text-white px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-primary-hover transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 w-full flex-1"> {children} </main>
        {/* Floating chatbot: hidden on /dashboard (has its own CTA + modal), visible on other pages */}
        {pathname !== "/dashboard" && <OwelChatbot />}

        <footer className="relative z-10 bg-[color:var(--theme-component-backdrop)] border-t border-white/5 py-6 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
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
      </div>
    </AuthGuard>
  );
}
