import { DashboardPage } from "@/components/layout/dashboard-page"
import { Skeleton } from "../ui/skeleton"
import { cn } from "@/lib/utils"
import { glassInset, glassPanel } from "@/lib/design"

export default function SellingLoading() {
    return (
        <DashboardPage atmosphere>
            <div className="mb-6">
                <Skeleton className="h-9 w-40" />
            </div>

            <section className={cn(glassPanel, "mb-8 space-y-8 p-6 lg:p-8")}>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                        <Skeleton className="size-14 shrink-0 rounded-md sm:size-16" />
                        <div className="space-y-3">
                            <Skeleton className="h-9 w-56" />
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-72 max-w-full" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-9 w-20" />
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className={cn(glassInset, "space-y-3 px-5 py-4")}
                        >
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-8 w-36" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="min-w-0 space-y-6">
                    <Skeleton className="h-52 w-full rounded-lg" />
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                </div>
                <Skeleton className="h-80 w-full rounded-lg" />
            </div>
        </DashboardPage>
    )
}
