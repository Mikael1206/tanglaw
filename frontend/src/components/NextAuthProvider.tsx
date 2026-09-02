"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BACKEND_UNAUTHORIZED_EVENT,
  SESSION_EXPIRED_ERROR,
} from "@/lib/auth-constants";
import { setAuthToken } from "@/lib/auth-storage";

function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [ready, setReady] = useState(false);
  const signOutInFlight = useRef(false);

  const endSession = useCallback(async () => {
    if (signOutInFlight.current) return;
    signOutInFlight.current = true;

    if (typeof window !== "undefined") {
      setAuthToken(null);
      window.dispatchEvent(new Event("tanglaw-auth-change"));
    }

    try {
      await signOut({ callbackUrl: `/login?error=${SESSION_EXPIRED_ERROR}` });
    } catch {
      if (typeof window !== "undefined") {
        window.location.replace(`/login?error=${SESSION_EXPIRED_ERROR}`);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const markReady = (value: boolean) => {
      queueMicrotask(() => {
        if (!cancelled) setReady(value);
      });
    };

    if (status === "loading") {
      markReady(false);
      return () => {
        cancelled = true;
      };
    }

    if (status !== "authenticated") {
      if (typeof window !== "undefined") {
        setAuthToken(null);
        window.dispatchEvent(new Event("tanglaw-auth-change"));
      }
      markReady(true);
      return () => {
        cancelled = true;
      };
    }

    const token = session.user?.token;
    const tokenExpiresAt = session.user?.tokenExpiresAt;
    const validExpiry = typeof tokenExpiresAt === "number" && Date.now() < tokenExpiresAt * 1000;

    if (!token || !validExpiry) {
      markReady(false);
      void endSession();
      return () => {
        cancelled = true;
      };
    }

    if (!setAuthToken(token)) {
      markReady(false);
      void endSession();
      return () => {
        cancelled = true;
      };
    }
    window.dispatchEvent(new Event("tanglaw-auth-change"));
    markReady(true);
    return () => {
      cancelled = true;
    };
  }, [endSession, session, status]);

  useEffect(() => {
    const handleUnauthorized = () => {
      void endSession();
    };

    window.addEventListener(BACKEND_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(BACKEND_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [endSession]);

  useEffect(() => {
    if (status !== "authenticated" || session?.error === SESSION_EXPIRED_ERROR) {
      if (session?.error === SESSION_EXPIRED_ERROR) void endSession();
      return;
    }

    const tokenExpiresAt = session.user?.tokenExpiresAt;
    if (typeof tokenExpiresAt !== "number") return;

    const delay = Math.max(0, tokenExpiresAt * 1000 - Date.now());
    const timer = window.setTimeout(() => void endSession(), delay);
    return () => window.clearTimeout(timer);
  }, [endSession, session, status]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-base-light text-text-primary px-4">
        <div className="rounded-3xl bg-[color:var(--theme-surface)] border border-accent-muted/40 p-8 shadow-2xl text-center max-w-sm">
          <p role="status" className="text-sm font-bold text-[color:var(--theme-typography-main)]">
            Verifying access…
          </p>
          <p className="text-xs text-[color:var(--theme-text-muted)] mt-2">
            Please wait while we prepare your session.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync>{children}</SessionSync>
    </SessionProvider>
  );
}
