"use client";

import { useEffect, useRef, useState } from "react";
import { getProviders, signIn, type ClientSafeProvider } from "next-auth/react";

type ProviderId = "google" | "azure-ad";

type AuthProviderButtonsProps = {
  actionLabel: "Continue" | "Sign in";
  disabled?: boolean;
};

const providerLabels: Record<ProviderId, string> = {
  google: "Google",
  "azure-ad": "Microsoft",
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" rx="1.5" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" rx="1.5" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" rx="1.5" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" rx="1.5" fill="#FFB900" />
    </svg>
  );
}

export default function AuthProviderButtons({ actionLabel, disabled = false }: AuthProviderButtonsProps) {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);
  const [pendingProvider, setPendingProvider] = useState<ProviderId | null>(null);
  const pendingProviderRef = useRef<ProviderId | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProviders()
      .then((available) => setProviders(available ?? {}))
      .catch(() => {
        setProviders({});
      });
  }, []);

  const beginSignIn = async (provider: ProviderId) => {
    if (disabled || pendingProviderRef.current || !providers?.[provider]) return;

    pendingProviderRef.current = provider;
    setPendingProvider(provider);
    setError(null);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch {
      pendingProviderRef.current = null;
      setPendingProvider(null);
      setError("Social sign-in could not be started. Please try again.");
    }
  };

  return (
    <div className="pt-4 border-t border-white/10">
      <p className="text-center text-sm font-semibold text-[color:var(--theme-typography-secondary)]">
        Or {actionLabel.toLowerCase()} with
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {(["google", "azure-ad"] as const).map((provider) => {
          const available = providers?.[provider];
          const isPending = pendingProvider === provider;
          const label = providerLabels[provider];
          return (
            <button
              key={provider}
              type="button"
              disabled={disabled || pendingProvider !== null || providers === null || !available}
              onClick={() => void beginSignIn(provider)}
              aria-label={`${actionLabel} with ${label}`}
              aria-busy={isPending}
              className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-[color:var(--theme-canvas)]/90 px-4 py-3 text-sm font-semibold text-[color:var(--theme-typography-main)] transition hover:bg-[color:var(--theme-canvas)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {provider === "google" ? <GoogleIcon /> : <MicrosoftIcon />}
              {providers === null
                ? "Checking availability..."
                : !available
                  ? `${label} sign-in unavailable`
                  : isPending
                    ? "Connecting..."
                    : `${actionLabel} with ${label}`}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-center text-xs font-semibold text-[#f1c2c2]">
          {error}
        </p>
      )}
    </div>
  );
}
