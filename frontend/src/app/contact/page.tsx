"use client";

/**
 * Contact page with a support form and team contact details.
 * This form currently simulates submission locally.
 */
import React, { useState } from "react";
import { Mail, MapPin, Building2, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [email, setEmail] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !messageText) {
      alert("Please fill out the required fields (Name, Email, Message).");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName("");
      setGroup("");
      setEmail("");
      setMessageText("");
    }, 1200);
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-base-light px-4 py-16 sm:px-6 lg:px-8 text-text-primary">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(27,64,121,0.14),_transparent_18%)]" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="text-center mb-14">
          <div className="mx-auto mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-[#c3d19d] font-black">
            <Mail className="h-4 w-4" /> Contact TANGLAW
          </div>
          <h1 className="font-display text-4xl font-black tracking-[-0.04em] text-[#f7f5d8] sm:text-5xl">
            Let us guide your next scholarship move.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#d3d7a7]">
            Have questions on scholarship criteria, research data, or the TANGLAW experience? Send a message and our team will respond shortly.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-white/10 bg-[#0d2145]/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-[#c7d8f0] font-black">
                Support Node
              </div>
              <h2 className="text-2xl font-black text-[#edf2ff]">Academic Sponsorship</h2>
              <div className="space-y-5 text-sm text-[#d2d8f3]">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-[#a8c8ff] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#f3f1d6]">Polytechnic University of the Philippines</p>
                    <p className="mt-1">Anonas St., Santa Mesa, Manila, Metro Manila 1016</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Building2 className="h-5 w-5 text-[#a8c8ff] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#edf2ff]">Department of Computer Science</p>
                    <p className="mt-1">College of Computer and Information Sciences</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.26em] text-[#a8bde8]">BSCS 1-2 (STS Research Class)</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <main className="rounded-[2rem] border border-white/10 bg-[#0b2349]/90 p-8 shadow-2xl shadow-black/20 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#adc6f1] font-bold">Reach Out</p>
                <h2 className="mt-3 text-2xl font-black text-[#f6f8ff]">Message the TANGLAW team</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-[#cfd8ff] font-black">
                <Send className="h-4 w-4" /> Response within 2 business days
              </div>
            </div>

            {submitted && (
              <div className="mb-6 rounded-3xl border border-[#4c7bc1]/40 bg-[#122c5f]/90 p-4 text-sm text-[#d5e0ff] shadow-inner">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#85a3ff] flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#f5f4d9]">Message received.</p>
                      <p className="mt-1 text-[#cfd8ff]">Your note is now queued for review by our student research team.</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-[#d4d9a5]">
                  <span className="font-semibold text-[#f7f6d8]">Full Name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-3xl border border-white/10 bg-[#0c264a]/95 px-4 py-3 text-sm text-[#eff0d8] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Juan dela Cruz"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm text-[#d4d9a5]">
                  <span className="font-semibold text-[#f7f6d8]">Email Address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-3xl border border-white/10 bg-[#0c264a]/95 px-4 py-3 text-sm text-[#eff0d8] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="juan@student.pup.edu.ph"
                    required
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm text-[#d4d9a5]">
                <span className="font-semibold text-[#f7f6d8]">Section / Program</span>
                <input
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-[#0b2658]/95 px-4 py-3 text-sm text-[#eff0d8] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="BSCS 1-2"
                />
              </label>

              <label className="space-y-2 text-sm text-[#d4d9a5]">
                <span className="font-semibold text-[#f7f6d8]">Message</span>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={5}
                  className="w-full rounded-[1.5rem] border border-white/10 bg-[#0b2658]/95 px-4 py-3 text-sm text-[#eff0d8] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Tell us how we can improve TANGLAW or ask about your scholarship match."
                  required
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-white/10"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
