"use client";

/**
 * Login page for the public authentication flow.
 * Uses local storage to simulate an authenticated session.
 */
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogIn, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { EtheralShadow } from "../../../../components/ui/etheral-shadow";
import { GlowingText } from "../../../../components/ui/glowing-text";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showOAuth, setShowOAuth] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: "error", text: "Please fill out all required fields." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-[color:var(--theme-canvas)] px-4 py-16 sm:px-6 lg:px-8 text-[color:var(--theme-text-body)]">
      <EtheralShadow
        animation={{ scale: 60, speed: 80 }}
        noise={{ opacity: 0.8, scale: 1.0 }}
        sizing="cover"
        lightColor="rgba(200, 230, 175, 0.85)"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(27,64,121,0.14),_transparent_18%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)]/90 p-10 shadow-2xl shadow-black/25 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">Scholarship Sanctuary</p>
          <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] text-[color:var(--theme-typography-main)] sm:text-5xl">
            <GlowingText glowType="primary">Welcome back, scholar.</GlowingText>
          </h1>
          <p className="mt-5 text-base leading-8 text-[color:var(--theme-text-body)]">
            Enter your credentials to continue exploring scholarships, readiness checks, and the Owel guidance environment.
          </p>
          <div className="mt-10 grid gap-4 rounded-[2rem] border border-white/10 bg-[color:var(--theme-canvas)]/90 p-6 text-sm text-[color:var(--theme-text-body)] shadow-inner">
            <p className="font-semibold text-[color:var(--theme-typography-main)]">What TANGLAW offers</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>Personalized grant matching</li>
              <li>Fast eligibility insight</li>
              <li>Mock exam readiness tools</li>
            </ul>
          </div>
        </section>

        <div className="rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)]/95 p-8 shadow-2xl shadow-black/25 backdrop-blur-sm">
          <div className="text-center mb-8">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">Secure Scholar Login</p>
            <h2 className="mt-4 text-3xl font-black text-[color:var(--theme-typography-main)]">
              <GlowingText glowType="secondary">Sign in to your dashboard</GlowingText>
            </h2>
          </div>

          {message && (
            <div
              className={`mb-6 rounded-3xl border p-4 text-sm font-semibold ${
                message.type === "success"
                  ? "border-[color:var(--theme-borders-system)] bg-[color:var(--theme-canvas)]/50 text-[color:var(--theme-text-body)]"
                  : "border-[#a96b6b] bg-[#3b1b1b] text-[#f1c2c2]"
              }`}
            >
              <div className="flex items-start gap-3">
                {message.type === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#85a3ff]" />
                ) : (
                  <ShieldAlert className="mt-0.5 h-5 w-5 text-[#f5b0af]" />
                )}
                <span>{message.text}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="space-y-2 text-sm text-[color:var(--theme-text-body)]">
              <span className="font-semibold text-[color:var(--theme-typography-main)]">Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@domain.edu.ph"
                className="w-full rounded-3xl border border-white/10 bg-[color:var(--theme-canvas)]/90 px-4 py-3 text-sm text-[color:var(--theme-text-body)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-[color:var(--theme-text-body)]">
              <span className="font-semibold text-[color:var(--theme-typography-main)]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="●●●●●●●●"
                className="w-full rounded-3xl border border-white/10 bg-[color:var(--theme-canvas)]/90 px-4 py-3 text-sm text-[color:var(--theme-text-body)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-white/10"
            >
              {loading ? "Verifying..." : <><LogIn className="h-4 w-4" /> Sign In</>}
            </button>

            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onMouseEnter={() => setShowOAuth(true)}
                onMouseLeave={() => setShowOAuth(false)}
                className="w-full text-center text-sm font-semibold text-[color:var(--theme-typography-secondary)] hover:text-[color:var(--theme-typography-main)] transition"
              >
                More Sign-In Options
              </button>

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={showOAuth ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
                onMouseEnter={() => setShowOAuth(true)}
                onMouseLeave={() => setShowOAuth(false)}
              >
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-[color:var(--theme-canvas)]/90 px-4 py-3 text-sm font-semibold text-[color:var(--theme-typography-main)] transition hover:bg-[color:var(--theme-canvas)]"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-[color:var(--theme-canvas)]/90 px-4 py-3 text-sm font-semibold text-[color:var(--theme-typography-main)] transition hover:bg-[color:var(--theme-canvas)]"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <rect x="1" y="1" width="10" height="10" rx="1.5" fill="#F25022"/>
                      <rect x="13" y="1" width="10" height="10" rx="1.5" fill="#7FBA00"/>
                      <rect x="1" y="13" width="10" height="10" rx="1.5" fill="#00A4EF"/>
                      <rect x="13" y="13" width="10" height="10" rx="1.5" fill="#FFB900"/>
                    </svg>
                    Sign in with Microsoft
                  </button>
                </div>
              </motion.div>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-[color:var(--theme-text-body)]">
            New to TANGLAW?{' '}
            <Link href="/signup" className="font-bold hover:underline">
              <GlowingText glowType="secondary" className="text-[color:var(--theme-typography-main)]">
                Create an account <ArrowRight className="inline-block h-3 w-3" />
              </GlowingText>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
