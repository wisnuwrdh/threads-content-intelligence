import { Skeleton, SkeletonCard, SkeletonInsightCard } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mb-3">
                <Skeleton className="h-3 w-12 mb-1.5" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <SkeletonInsightCard />
        </div>
      </div>
    </div>
  )
}
