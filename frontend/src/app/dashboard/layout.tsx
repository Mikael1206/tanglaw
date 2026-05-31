"use client";

/**
 * Layout wrapper for dashboard pages.
 * Applies secure guard, header navigation, and embedded chatbot UI.
 */
import Link from "next/link";
import { LogOut, Home, Sparkles, BookOpen, ShieldCheck, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
import ThemeChanger from "@/components/theme-changer";
import OwelChatbot from "@/components/owel-chatbot";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

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
        <header className="border-b border-accent-muted/40 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-zinc-900">
                <Sparkles className="h-5 w-5 text-primary" />
                DASHBOARD
              </Link>
              <nav className="flex flex-wrap gap-3 text-[11px] uppercase font-bold tracking-widest text-zinc-600">
                <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Overview</Link>
                <Link href="/dashboard/scholarships" className="hover:text-zinc-900 transition-colors">Scholarships</Link>
                <Link href="/dashboard/readiness" className="hover:text-zinc-900 transition-colors">Readiness</Link>
                <Link href="/dashboard/reviewer" className="hover:text-zinc-900 transition-colors">Exam Reviewer</Link>
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-end">
              <ThemeChanger />
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-primary-hover transition-colors"
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
