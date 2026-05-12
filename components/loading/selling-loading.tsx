import { Skeleton } from "../ui/skeleton"

export default function SellingLoading() {
    return (
        <div className="px-4 lg:px-6">
            <div className="flex flex-row items-center justify-between gap-x-4 mb-5">
                <div>
                    <Skeleton className="w-100 h-8 mb-2" />
                    <Skeleton className="w-75 h-5" />
                </div>
                <div>
                    <Skeleton className="w-25 h-9" />
                </div>
            </div>
            <div className="flex flex-row items-start justify-between gap-x-4 my-8">
                <div className="w-[70%]">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-40 w-full" />
                </div>
                <div className="w-[30%]">
                    <Skeleton className="h-60 w-full" />
                </div>
            </div>
        </div>
    )
}
