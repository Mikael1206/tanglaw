"use client";

import dynamic from "next/dynamic";

const LandingBackground = dynamic(
  () => import("../../components/ui/landing-animations").then((mod) => mod.LandingBackground),
  { ssr: false }
);

export function DynamicLandingBackground() {
  return <LandingBackground />;
}
