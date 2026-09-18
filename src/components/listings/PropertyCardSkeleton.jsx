import { Skeleton } from "../ui/Skeleton";

export default function PropertyCardSkeleton() {
  return (
    <div className="group flex flex-col bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
      {/* Image Skeleton */}
      <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-col p-4 grow">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        <Skeleton className="h-5 w-3/4 mb-1.5" />
        <Skeleton className="h-4 w-1/2 mb-4" />

        <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-border">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
