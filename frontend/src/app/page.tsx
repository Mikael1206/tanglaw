/**
 * Public landing page for the TANGLAW application.
 * Renders as a Server Component — HTML is pre-rendered on the server.
 * All animations and interactivity live in leaf Client Components.
 */
import { DynamicLandingBackground } from "@/components/dynamic-landing-background";
import HomeClient from "./home-client";

export default function Home() {
  return (
    <div className="relative bg-[color:var(--theme-canvas)] font-sans text-[color:var(--theme-text-body)]">
      <DynamicLandingBackground />
      <HomeClient />
    </div>
  );
}
