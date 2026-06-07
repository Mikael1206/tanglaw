/**
 * Root layout for the Next.js application.
 * Configures fonts, metadata, global styles, and shared page chrome.
 */
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import NatureCanvas from "@/components/nature-canvas";
import SiteHeader from "@/components/site-header";
import NextAuthProvider from "@/components/NextAuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TANGLAW | AI-Powered Scholarship Navigation",
  description:
    "TANGLAW is an AI-first scholarship navigator for Filipino learners, combining readiness checks, grant discovery, and guidance into a single academic dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <body className="relative min-h-full flex flex-col bg-base-light text-text-primary">
        <NatureCanvas />

        <NextAuthProvider>
          <SiteHeader />
          <main className="flex-grow flex flex-col">{children}</main>
        </NextAuthProvider>

        <footer className="bg-[color:var(--theme-component-backdrop)] border-t border-white/5 py-8 px-4 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--theme-typography-secondary)] font-black">
                TANGLAW RESEARCH PROJECT © 2026
              </p>
              <p className="text-[10px] text-[color:var(--theme-typography-secondary)] mt-1">
                Science, Technology, and Society (BSCS 1-2)
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-[10px] text-[color:var(--theme-typography-secondary)] uppercase tracking-[0.28em] font-semibold">
              <Link href="/about" className="hover:text-[color:var(--theme-typography-main)]">
                The Minds Behind Us
              </Link>
              <span className="text-white/20">|</span>
              <a href="https://pup.edu.ph" target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--theme-typography-main)]">
                PUP Manila
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
