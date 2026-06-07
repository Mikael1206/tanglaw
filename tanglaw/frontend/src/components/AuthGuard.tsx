"use client";

/**
 * Authentication guard for the dashboard.
 * Redirects unauthenticated users to the login page.
 */
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/login");
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen grid place-items-center bg-base-light text-text-primary px-4">
        <div className="rounded-3xl bg-[color:var(--theme-surface)] border border-accent-muted/40 p-8 shadow-2xl text-center max-w-sm">
          <p className="text-sm font-bold text-[color:var(--theme-typography-main)]">Verifying access…</p>
          <p className="text-xs text-[color:var(--theme-text-muted)] mt-2">Please wait while we prepare your dashboard.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
