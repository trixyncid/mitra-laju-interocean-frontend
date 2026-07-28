import { Skeleton } from "../ui/skeleton"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { cn } from "@/lib/utils"
import { glassInset, glassPanel } from "@/lib/design"

export default function CostingLoading() {
    return (
        <DashboardPage atmosphere>
            <div className="mb-6">
                <Skeleton className="h-9 w-40" />
            </div>

            <section className={cn(glassPanel, "mb-8 overflow-hidden p-6 lg:p-8")}>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4 sm:gap-5">
                        <Skeleton className="size-14 shrink-0 rounded-md sm:size-16" />
                        <div className="space-y-3">
                            <Skeleton className="h-9 w-56" />
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-72 max-w-full" />
                            <Skeleton className="h-4 w-64 max-w-full" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="size-9" />
                    </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className={cn(glassInset, "space-y-3 px-5 py-4")}
                        >
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="space-y-6">
                    <section className={cn(glassPanel, "space-y-6 p-6 lg:p-8")}>
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-40" />
                            <Skeleton className="h-4 w-72 max-w-full" />
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-5 w-40" />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={cn(glassPanel, "space-y-6 p-6 lg:p-8")}>
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-36" />
                            <Skeleton className="h-4 w-64 max-w-full" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Skeleton className="h-28 w-full rounded-md" />
                            <Skeleton className="h-28 w-full rounded-md" />
                        </div>
                    </section>

                    <section className={cn(glassPanel, "space-y-6 p-6 lg:p-8")}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-48" />
                                <Skeleton className="h-4 w-56 max-w-full" />
                            </div>
                            <Skeleton className="h-9 w-28" />
                        </div>
                        <Skeleton className="h-36 w-full rounded-md" />
                    </section>
                </div>

                <aside>
                    <section className={cn(glassPanel, "space-y-5 p-6 lg:p-8")}>
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-40" />
                            <Skeleton className="h-4 w-48 max-w-full" />
                        </div>
                        <Skeleton className="h-28 w-full rounded-md" />
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between gap-4"
                                >
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </DashboardPage>
    )
}
