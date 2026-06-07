"use client";

/**
 * Signup page for the public authentication flow.
 * Creates a simulated user session in local storage.
 */
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { signupAccount } from "@/lib/backend";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showOAuth, setShowOAuth] = useState(false);

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

      if (signInResult?.error) {
        setMessage({ type: "error", text: signInResult.error });
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to create account.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-[color:var(--theme-canvas)] px-4 py-16 sm:px-6 lg:px-8 text-[color:var(--theme-text-body)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(27,64,121,0.14),_transparent_18%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/10 bg-[color:var(--theme-surface)]/90 p-10 shadow-2xl shadow-black/25 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">New Scholar Portal</p>
          <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] text-[color:var(--theme-typography-main)] sm:text-5xl">
            Start your TANGLAW journey.
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
          <div className="text-center mb-8">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[color:var(--theme-typography-secondary)] font-black">Create your account</p>
            <h2 className="mt-4 text-3xl font-black text-[color:var(--theme-typography-main)]">Register as a scholar</h2>
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

          <form onSubmit={handleSubmit} className="space-y-5">
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-white/10"
            >
              {loading ? "Registering..." : <><UserPlus className="h-4 w-4" /> Create Account</>}
            </button>

            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onMouseEnter={() => setShowOAuth(true)}
                onMouseLeave={() => setShowOAuth(false)}
                className="w-full text-center text-sm font-semibold text-[color:var(--theme-typography-secondary)] hover:text-[color:var(--theme-typography-main)] transition"
              >
                Prefer fast sign-up?
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
                    className="w-full rounded-full border border-white/15 bg-[color:var(--theme-canvas)]/90 px-4 py-3 text-sm font-semibold text-[color:var(--theme-typography-main)] transition hover:bg-[color:var(--theme-canvas)]"
                  >
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-full border border-white/15 bg-[color:var(--theme-canvas)]/90 px-4 py-3 text-sm font-semibold text-[color:var(--theme-typography-main)] transition hover:bg-[color:var(--theme-canvas)]"
                  >
                    Continue with Microsoft
                  </button>
                </div>
              </motion.div>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-[color:var(--theme-text-body)]">
            Already a scholar?{' '}
            <Link href="/login" className="font-bold text-[color:var(--theme-typography-main)] hover:underline">
              Log In <ArrowLeft className="inline-block h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
