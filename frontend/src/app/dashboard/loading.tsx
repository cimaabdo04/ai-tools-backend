export default function DashboardLoading() {
  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-7 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-56 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-card">
        <div className="p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
