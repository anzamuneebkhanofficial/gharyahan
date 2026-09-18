import { Skeleton } from "../ui/Skeleton";

export default function TableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search & Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-10 w-full sm:w-32" />
      </div>

      {/* Table Container Skeleton */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-border bg-muted/20">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16 justify-self-end" />
        </div>
        
        {/* Table Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b border-border last:border-0 items-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
