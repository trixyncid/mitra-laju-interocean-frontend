import { Skeleton } from "../ui/skeleton";

export default function ShipmentLoading() {
    return (
        <div className="px-4 lg:px-6">
            <Skeleton className="w-50 h-5 mb-8" />

            <div className="flex flex-row items-center justify-between gap-x-4">
                <div>
                    <Skeleton className="w-75 h-8 mb-2" />
                    <Skeleton className="w-100 h-5" />
                </div>

                <div className="flex flex-row items-start justify-between gap-x-4">
                    <Skeleton className="w-50 h-5" />
                    <Skeleton className="w-10 h-5" />
                </div>
            </div>

            <div className="flex flex-row items-start justify-between gap-x-4 my-8">
                {/* Right */}
                <div className="w-[70%]">
                    <Skeleton className="h-50 w-full" />
                    <Skeleton className="h-30 w-full my-4" />
                    <Skeleton className="h-50 w-full my-4" />
                    <Skeleton className="h-50 w-full my-4" />
                </div>

                <div className="w-[30%]">
                    <Skeleton className="h-60 w-full" />
                </div>
            </div>
        </div>
    )
}