import { Skeleton } from "../ui/Skeleton";

export default function ProfileSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-7 max-w-3xl">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-6 border-b border-border/50 pb-6">
          <Skeleton className="h-24 w-24 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-64 max-w-full" />
            <Skeleton className="h-8 w-full max-w-sm mt-2" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full sm:col-span-2" />
        </div>
      </div>
    </div>
  );
}
