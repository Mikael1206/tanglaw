"use client";

/**
 * Public redirect page for the branded readiness route.
 * Sends unauthenticated visitors to the login page.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlowingText } from "../../../../components/ui/glowing-text";

export default function ReadinessPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-light px-4 py-12">
      <div className="max-w-lg rounded-[2rem] border border-accent-muted/30 bg-white p-10 shadow-2xl text-center">
        <h1 className="font-display text-3xl font-black text-zinc-900 mb-4"><GlowingText glowType="primary">Readiness check moved to the secure dashboard</GlowingText></h1>
        <p className="text-sm leading-relaxed text-zinc-600 mb-6">
          The readiness assessment is only available through the authenticated Scholar Hub. Please log in to continue.
        </p>
        <div className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-white">
          Redirecting to login...
        </div>
      </div>
    </div>
  );
}
