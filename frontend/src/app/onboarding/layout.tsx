"use client";

import NextAuthProvider from "@/components/NextAuthProvider";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
