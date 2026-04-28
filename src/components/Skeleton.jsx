export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-shimmer rounded-md bg-[linear-gradient(90deg,#1a1a1a_0%,#262626_50%,#1a1a1a_100%)] bg-[length:800px_100%] ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-ink-800 bg-ink-900 p-3">
      <Skeleton className="h-20 w-14 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
