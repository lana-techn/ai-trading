export default function AnalysisLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="h-10 w-72 bg-muted animate-pulse rounded"></div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3 p-6 border border-border rounded-lg">
            <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
            <div className="h-32 bg-muted animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
