import dynamic from "next/dynamic";

const AboutClient = dynamic(() => import("./about-client"), {
  loading: () => (
    <div className="relative overflow-hidden bg-[color:var(--theme-canvas)] pt-28 pb-20 text-[color:var(--theme-text-body)]">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="h-10 w-48 mx-auto rounded-full bg-white/5 animate-pulse" />
          <div className="h-12 w-96 mx-auto mt-6 rounded bg-white/5 animate-pulse" />
          <div className="h-6 w-80 mx-auto mt-6 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  ),
});

export default function AboutPage() {
  return <AboutClient />;
}
