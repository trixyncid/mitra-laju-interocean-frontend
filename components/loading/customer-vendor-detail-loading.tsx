import { Skeleton } from "../ui/skeleton"
import { DashboardPage } from "@/components/layout/dashboard-page"

export default function CustomerVendorDetailLoading() {
    return (
        <DashboardPage atmosphere>
            <Skeleton className="mb-6 h-9 w-44 rounded-md border border-[rgba(214,227,255,0.35)] bg-[rgba(214,227,255,0.35)]" />

            <div className="overflow-hidden rounded-lg border border-[rgba(214,227,255,0.45)] bg-[rgba(232,238,246,0.55)] p-6 lg:p-8">
                <div className="flex items-start gap-4">
                    <Skeleton className="size-16 shrink-0 rounded-md bg-[rgba(214,227,255,0.4)]" />
                    <div className="min-w-0 flex-1 space-y-3">
                        <Skeleton className="h-8 w-2/3 max-w-md rounded-md bg-[rgba(214,227,255,0.4)]" />
                        <Skeleton className="h-4 w-40 rounded-md bg-[rgba(214,227,255,0.35)]" />
                        <Skeleton className="h-4 w-72 max-w-full rounded-md bg-[rgba(214,227,255,0.3)]" />
                    </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className="h-28 rounded-md border border-[rgba(214,227,255,0.35)] bg-[rgba(214,227,255,0.3)]"
                        />
                    ))}
                </div>
            </div>

            <Skeleton className="mt-8 h-11 w-full max-w-xl rounded-md border border-[rgba(214,227,255,0.35)] bg-[rgba(214,227,255,0.35)]" />
            <Skeleton className="mt-6 h-80 w-full rounded-lg border border-[rgba(214,227,255,0.35)] bg-[rgba(214,227,255,0.3)]" />
        </DashboardPage>
    )
}
