"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (session?.user?.token) {
      window.localStorage.setItem("tanglaw-token", session.user.token);
    } else {
      window.localStorage.removeItem("tanglaw-token");
    }
  }, [session]);

  return <>{children}</>;
}

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync>{children}</SessionSync>
    </SessionProvider>
  );
}
