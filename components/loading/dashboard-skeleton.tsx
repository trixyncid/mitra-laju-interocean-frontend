import { Skeleton } from "@/components/ui/skeleton"
import {
  COSTING_MODULE_ENABLED,
  FINANCIAL_MODULES_ENABLED,
  SELLING_MODULE_ENABLED,
} from "@/lib/feature-flags"

export default function DashboardSkeleton() {
  const kpiCount = FINANCIAL_MODULES_ENABLED
    ? 1 +
      (SELLING_MODULE_ENABLED ? 1 : 0) +
      (COSTING_MODULE_ENABLED ? 1 : 0) +
      1
    : 4
  const rankingCount =
    1 + (SELLING_MODULE_ENABLED ? 1 : 0) + (COSTING_MODULE_ENABLED ? 2 : 0)

  return (
    <div className="mt-8 space-y-6 lg:space-y-8">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: kpiCount }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-32 rounded-lg border border-[rgba(214,227,255,0.35)] bg-[rgba(214,227,255,0.35)]"
            />
          ))}
        </div>
        <Skeleton className="h-40 rounded-lg border border-[rgba(214,227,255,0.35)] bg-[rgba(214,227,255,0.35)]" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-lg border border-[rgba(214,227,255,0.35)] bg-[rgba(214,227,255,0.35)]" />
        <Skeleton className="h-80 rounded-lg border border-[rgba(214,227,255,0.35)] bg-[rgba(214,227,255,0.35)]" />
      </div>
      {FINANCIAL_MODULES_ENABLED ? (
        <Skeleton className="h-80 rounded-lg border border-[rgba(214,227,255,0.35)] bg-[rgba(214,227,255,0.35)]" />
      ) : null}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: rankingCount }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-72 rounded-lg border border-[rgba(214,227,255,0.35)] bg-[rgba(214,227,255,0.35)]"
          />
        ))}
      </div>
    </div>
  )
}
