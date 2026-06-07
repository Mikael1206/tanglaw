"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only act on definitive session states — never clear the token
    // during loading/transition states to avoid signing out during
    // client-side navigation between routes.
    if (status === "loading") return;

    if (session?.user?.token) {
      window.localStorage.setItem("tanglaw-token", session.user.token);
    } else {
      window.localStorage.removeItem("tanglaw-token");
    }
  }, [session, status]);

  return <>{children}</>;
}

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync>{children}</SessionSync>
    </SessionProvider>
  );
}
