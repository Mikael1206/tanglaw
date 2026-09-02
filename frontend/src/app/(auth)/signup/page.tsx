"use client";

/**
 * Signup page for the public authentication flow.
 * Creates the account, then lets NextAuth establish the session.
 */
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import dynamic from "next/dynamic";
import { GlowingText } from "../../../../components/ui/glowing-text";
import AuthProviderButtons from "@/components/auth-provider-buttons";
import { getAuthErrorMessage } from "@/lib/auth-constants";

const EtheralShadow = dynamic(
  () => import("../../../../components/ui/etheral-shadow").then((mod) => mod.EtheralShadow),
  { ssr: false }
);
import { signupAccount } from "@/lib/backend";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setMessage({ type: "error", text: "Please fill out all required fields." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await signupAccount(fullName, email, password);
      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.ok !== true) {
        setMessage({ type: "error", text: getAuthErrorMessage(signInResult?.error) ?? "Unable to create account. Please try again." });
      } else {
        router.push("/dashboard");
      }
    } catch {
      setMessage({
        type: "error",
        text: "Unable to create account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-[color:var(--theme-canvas)] text-[color:var(--theme-text-body)] flex flex-col">
      <EtheralShadow
        animation={{ scale: 60, speed: 80 }}
        noise={{ opacity: 0.8, scale: 1.0 }}
        sizing="cover"
        lightColor="rgba(200, 230, 175, 0.85)"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(27,64,121,0.14),_transparent_18%)]" />
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.95fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)]/90 p-10 shadow-2xl shadow-black/25 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">New Scholar Portal</p>
          <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] text-[color:var(--theme-typography-main)] sm:text-5xl">
            <GlowingText glowType="primary">Start your TANGLAW journey.</GlowingText>
          </h1>
          <p className="mt-5 text-base leading-8 text-[color:var(--theme-text-body)]">
            Create your student account and gain access to personalized scholarship matching, exam review tools, and the Owel learning companion.
          </p>
          <div className="mt-10 grid gap-4 rounded-[2rem] border border-white/10 bg-[color:var(--theme-canvas)]/90 p-6 text-sm text-[color:var(--theme-text-body)] shadow-inner">
            <p className="font-semibold text-[color:var(--theme-typography-main)]">Get started with</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>Scholarship search workflows</li>
              <li>Readiness check modules</li>
              <li>Real-time grant guidance</li>
            </ul>
          </div>
        </section>

        <div className="rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)]/95 p-8 shadow-2xl shadow-black/25 backdrop-blur-sm">
          <div className="text-center mb-6">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">Create your account</p>
            <h2 className="mt-3 text-3xl font-black text-[color:var(--theme-typography-main)]">
              <GlowingText glowType="secondary">Register as a scholar</GlowingText>
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="space-y-2 text-sm text-[color:var(--theme-text-body)]">
              <span className="font-semibold text-[color:var(--theme-typography-main)]">Full Name</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan dela Cruz"
                className="w-full rounded-3xl border border-white/10 bg-[color:var(--theme-canvas)]/90 px-4 py-3 text-sm text-[color:var(--theme-text-body)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-[color:var(--theme-text-body)]">
              <span className="font-semibold text-[color:var(--theme-typography-main)]">Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@domain.edu.ph"
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
                placeholder="Minimum 8 characters"
                className="w-full rounded-3xl border border-white/10 bg-[color:var(--theme-canvas)]/90 px-4 py-3 text-sm text-[color:var(--theme-text-body)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-white/10"
            >
              {loading ? "Registering..." : <><UserPlus className="h-4 w-4" /> Create Account</>}
            </button>

            <AuthProviderButtons
              actionLabel="Continue"
              disabled={loading}
            />
          </form>

          <p className="mt-6 text-center text-sm text-[color:var(--theme-text-body)]">
            Already a scholar?{' '}
            <Link href="/login" className="font-bold hover:underline">
              <GlowingText glowType="secondary" className="text-[color:var(--theme-typography-main)]">
                Log In <ArrowLeft className="inline-block h-3 w-3" />
              </GlowingText>
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
