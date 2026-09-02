import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";

const authMocks = vi.hoisted(() => ({
  signOut: vi.fn().mockResolvedValue(undefined),
  useSession: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  signOut: authMocks.signOut,
  useSession: authMocks.useSession,
}));

import NextAuthProvider from "../components/NextAuthProvider";

function installStorage() {
  const values = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, String(value)),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    },
  });
  return values;
}

describe("SessionSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installStorage();
    authMocks.useSession.mockReturnValue({
      status: "authenticated",
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
          token: "backend-token",
          tokenExpiresAt: Math.floor(Date.now() / 1000) + 3600,
        },
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("withholds children until the backend token is synchronized", async () => {
    const values = installStorage();
    render(
      <NextAuthProvider>
        <p>Protected dashboard</p>
      </NextAuthProvider>
    );

    expect(screen.queryByText("Protected dashboard")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Protected dashboard")).toBeInTheDocument());
    expect(values.get("tanglaw-token")).toBe("backend-token");
  });

  it("signs out at the absolute backend expiry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    authMocks.useSession.mockReturnValue({
      status: "authenticated",
      data: { user: { token: "backend-token", tokenExpiresAt: 1 } },
    });

    render(
      <NextAuthProvider>
        <p>Protected dashboard</p>
      </NextAuthProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(1_000);
      await Promise.resolve();
    });

    expect(authMocks.signOut).toHaveBeenCalledWith({ callbackUrl: "/login?error=SessionExpired" });
  });

  it("signs out when a protected backend request returns 401", async () => {
    render(
      <NextAuthProvider>
        <p>Protected dashboard</p>
      </NextAuthProvider>
    );
    await waitFor(() => expect(screen.getByText("Protected dashboard")).toBeInTheDocument());

    await act(async () => {
      window.dispatchEvent(new Event("tanglaw-backend-unauthorized"));
      await Promise.resolve();
    });

    expect(authMocks.signOut).toHaveBeenCalledWith({ callbackUrl: "/login?error=SessionExpired" });
  });
});
