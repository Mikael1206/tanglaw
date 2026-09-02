import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

const authMocks = vi.hoisted(() => ({
  getProviders: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock("next-auth/react", () => authMocks);

import AuthProviderButtons from "../components/auth-provider-buttons";

describe("AuthProviderButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.getProviders.mockResolvedValue({
      google: { id: "google", name: "Google" },
      "azure-ad": { id: "azure-ad", name: "Microsoft" },
    });
  });

  it("uses the stable Google and Microsoft provider IDs", async () => {
    const user = userEvent.setup();
    render(<AuthProviderButtons actionLabel="Sign in" />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Sign in with Google" }));

    expect(authMocks.signIn).toHaveBeenCalledWith("google", { callbackUrl: "/dashboard" });
  });

  it("blocks the second provider after one click", async () => {
    const user = userEvent.setup();
    authMocks.signIn.mockReturnValue(new Promise(() => undefined));
    render(<AuthProviderButtons actionLabel="Continue" />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Continue with Google" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Continue with Google" }));
    await user.click(screen.getByRole("button", { name: "Continue with Microsoft" }));

    expect(authMocks.signIn).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Continue with Microsoft" })).toBeDisabled();
  });

  it("shows a disabled unavailable state when a provider is not configured", async () => {
    authMocks.getProviders.mockResolvedValue({ credentials: { id: "credentials", name: "Credentials" } });
    render(<AuthProviderButtons actionLabel="Sign in" />);

    await waitFor(() => expect(screen.getByText("Google sign-in unavailable")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sign in with Microsoft" })).toBeDisabled();
  });
});
