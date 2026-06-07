"use client";

/**
 * Public placeholder page that redirects users to login when they try to access scholarship content.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScholarshipsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-light px-4 py-12">
      <div className="max-w-lg rounded-[2rem] border border-accent-muted/30 bg-white p-10 shadow-2xl text-center">
        <h1 className="font-display text-3xl font-black text-zinc-900 mb-4">Scholarship workspace moved to the secure dashboard</h1>
        <p className="text-sm leading-relaxed text-zinc-600 mb-6">
          The scholarship directory is now accessible exclusively after authentication. Sign in to continue to your secure Scholar Hub.
        </p>
        <div className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-white">
          Redirecting to login...
        </div>
      </div>
    </div>
  );
}
