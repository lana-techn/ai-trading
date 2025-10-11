export default function ChatLoading() {
  return (
    <div className="container mx-auto p-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="h-12 w-64 bg-muted animate-pulse rounded mb-6"></div>
      <div className="flex-1 space-y-4 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-10 w-10 bg-muted animate-pulse rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-16 bg-muted animate-pulse rounded-lg mt-4"></div>
    </div>
  );
}
