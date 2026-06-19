import { Skeleton, SkeletonInsightCard } from "@/components/ui/skeleton"

export default function InsightsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SkeletonInsightCard />
        <SkeletonInsightCard />
      </div>

      <Skeleton className="h-6 w-32 mb-4 mt-8" />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonInsightCard key={i} />
        ))}
      </div>
    </div>
  )
}
