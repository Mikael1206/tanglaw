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
      <div className="min-h-screen bg-base-light text-text-primary">
        <header className="relative z-50 border-b border-accent-muted/40 bg-white">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-zinc-900">
                <Sparkles className="h-5 w-5 text-primary" />
                DASHBOARD
              </Link>
              <nav className="hidden sm:flex flex-wrap gap-3 text-[11px] uppercase font-bold tracking-widest text-zinc-600">
                <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Overview</Link>
                <Link href="/dashboard/scholarships" className="hover:text-zinc-900 transition-colors">Scholarships</Link>
                <Link href="/dashboard/readiness" className="hover:text-zinc-900 transition-colors">Readiness</Link>
                <Link href="/dashboard/reviewer" className="hover:text-zinc-900 transition-colors">Exam Reviewer</Link>
              </nav>
            </div>

            <div className="flex items-center gap-3" ref={menuRef}>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="sm:hidden flex items-center justify-center h-10 w-10 rounded-full border border-accent-muted/40 bg-white hover:bg-zinc-50 transition"
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={menuOpen}
              >
                {menuOpen ? (
                  <X className="h-5 w-5 text-zinc-700" />
                ) : (
                  <Menu className="h-5 w-5 text-zinc-700" />
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
                      className="absolute top-full left-0 right-0 z-50 sm:hidden border-b border-accent-muted/40 bg-white shadow-2xl shadow-black/15 origin-top"
                    >
                    <nav className="max-w-7xl mx-auto px-4 py-5 flex flex-col gap-3 text-[11px] uppercase font-bold tracking-widest text-zinc-600">
                      <Link
                        href="/dashboard"
                        className={`transition px-4 py-3 rounded-full ${
                          pathname === "/dashboard"
                            ? "bg-primary/10 text-primary font-black"
                            : "hover:bg-zinc-50 hover:text-zinc-900"
                        }`}
                      >
                        Overview
                      </Link>
                      <Link
                        href="/dashboard/scholarships"
                        className={`transition px-4 py-3 rounded-full ${
                          pathname === "/dashboard/scholarships"
                            ? "bg-primary/10 text-primary font-black"
                            : "hover:bg-zinc-50 hover:text-zinc-900"
                        }`}
                      >
                        Scholarships
                      </Link>
                      <Link
                        href="/dashboard/readiness"
                        className={`transition px-4 py-3 rounded-full ${
                          pathname === "/dashboard/readiness"
                            ? "bg-primary/10 text-primary font-black"
                            : "hover:bg-zinc-50 hover:text-zinc-900"
                        }`}
                      >
                        Readiness
                      </Link>
                      <Link
                        href="/dashboard/reviewer"
                        className={`transition px-4 py-3 rounded-full ${
                          pathname === "/dashboard/reviewer"
                            ? "bg-primary/10 text-primary font-black"
                            : "hover:bg-zinc-50 hover:text-zinc-900"
                        }`}
                      >
                        Exam Reviewer
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

        <main className="max-w-7xl mx-auto px-4 py-8"> {children} </main>
        <OwelChatbot />
      </div>
    </AuthGuard>
  );
}
