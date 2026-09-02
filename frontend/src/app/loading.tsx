export default function Loading() {
  return (
    <div className="min-h-screen bg-[color:var(--theme-canvas)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/20 animate-pulse" />
        <div className="h-4 w-32 rounded-full bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}
