import { Skeleton } from "@/components/ui/skeleton"
import { FINANCIAL_MODULES_ENABLED } from "@/lib/feature-flags"

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: FINANCIAL_MODULES_ENABLED ? 4 : 1 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-32 rounded-lg border border-[rgba(214,227,255,0.35)] bg-[rgba(214,227,255,0.35)]"
          />
        ))}
      </div>
      <div
        className={
          FINANCIAL_MODULES_ENABLED
            ? "grid grid-cols-1 gap-6 xl:grid-cols-2"
            : undefined
        }
      >
        {FINANCIAL_MODULES_ENABLED ? (
          <Skeleton className="h-80 rounded-lg border border-[rgba(214,227,255,0.35)] bg-[rgba(214,227,255,0.35)]" />
        ) : null}
        <Skeleton className="h-80 rounded-lg border border-[rgba(214,227,255,0.35)] bg-[rgba(214,227,255,0.35)]" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: FINANCIAL_MODULES_ENABLED ? 4 : 1 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-72 rounded-lg border border-[rgba(214,227,255,0.35)] bg-[rgba(214,227,255,0.35)]"
          />
        ))}
      </div>
    </div>
  )
}
