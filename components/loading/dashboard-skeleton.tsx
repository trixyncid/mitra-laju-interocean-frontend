import { Skeleton } from "@/components/ui/skeleton"

const block = "bg-card"

export default function DashboardSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid grid-cols-1 gap-4 lg:gap-5 xl:grid-cols-12">
        <div className="flex flex-col gap-4 lg:gap-5 xl:col-span-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className={`size-16 rounded-full ${block}`} />
                <div className="flex-1 space-y-2">
                  <Skeleton className={`h-8 w-20 rounded-full ${block}`} />
                  <Skeleton className={`h-4 w-28 rounded-full ${block}`} />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className={`h-[440px] rounded-2xl ${block}`} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:col-span-3 xl:grid-cols-1">
          <Skeleton className={`h-[260px] rounded-2xl ${block}`} />
          <Skeleton className={`h-[260px] rounded-2xl ${block}`} />
        </div>
        <Skeleton className={`h-[540px] rounded-2xl xl:col-span-3 ${block}`} />
      </div>
      <Skeleton className={`h-80 rounded-2xl ${block}`} />
    </div>
  )
}
