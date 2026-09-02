export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-40 rounded-[2rem] bg-[color:var(--theme-surface)]/60" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-48 rounded-[2rem] bg-[color:var(--theme-surface)]/60" />
        <div className="h-64 rounded-[2rem] bg-[color:var(--theme-surface)]/60" />
      </div>
    </div>
  );
}
