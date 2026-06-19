import { Skeleton, SkeletonRow } from "@/components/ui/skeleton"

export default function ContentLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-4 w-48 mb-6" />

      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>

      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>

      <div className="flex items-center justify-between mt-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
