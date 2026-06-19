import { Skeleton, SkeletonCard, SkeletonChart } from "@/components/ui/skeleton"

export default function AnalyticsLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32 mb-6" />

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <SkeletonChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="grid grid-cols-7 gap-1">
              {[...Array(168)].map((_, i) => (
                <Skeleton key={i} className="w-full aspect-square rounded" />
              ))}
            </div>
          </div>
        </div>
        <SkeletonCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
