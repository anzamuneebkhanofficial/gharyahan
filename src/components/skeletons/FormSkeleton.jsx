import { Skeleton } from "../ui/Skeleton";

export default function FormSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, sectionIdx) => (
          <div key={sectionIdx} className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-6">
            {/* Section Title */}
            <div className="flex items-center gap-2 border-b border-border/50 pb-4">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-5 w-48" />
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, inputIdx) => (
                <div key={inputIdx} className={`space-y-2 ${inputIdx === 3 ? 'sm:col-span-2' : ''}`}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>
    </div>
  );
}
