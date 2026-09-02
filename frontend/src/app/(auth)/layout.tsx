"use client";

import NextAuthProvider from "@/components/NextAuthProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
