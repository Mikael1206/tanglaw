/**
 * Root layout for the Next.js application.
 * Configures fonts, metadata, global styles, and shared page chrome.
 */
import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { DynamicNatureCanvas } from "@/components/dynamic-backgrounds";
import GlowCursorLayer from "@/components/glow-cursor-layer";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { ThemeProvider } from "next-themes";
import FaviconSwitcher from "@/components/favicon-switcher";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "600", "700"],
  preload: true,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["700"],
  preload: true,
});

export const metadata: Metadata = {
  title: "TANGLAW | AI-Powered Scholarship Navigation",
  description:
    "TANGLAW is an AI-first scholarship navigator for Filipino learners, combining readiness checks, grant discovery, and guidance into a single academic dashboard.",
  icons: {      icon: [
        { url: "/assets/owel-head.svg", sizes: "any", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
        { url: "/assets/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/assets/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/assets/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      ],
    apple: [
      { url: "/assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="relative min-h-full flex flex-col bg-base-light text-text-primary">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <FaviconSwitcher />
        <Suspense fallback={null}>
          <DynamicNatureCanvas />
          <GlowCursorLayer />
        </Suspense>

        <SiteHeader />
        <main className="flex-grow flex flex-col">{children}</main>
        <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
