import { Skeleton } from "./ui/skeleton";

export default function DetailPageSkeleton() {
    return (
        <div className="px-4 lg:px-6">
            <div className="mb-5">
                <Skeleton className="w-100 h-6 mb-2" />
                <Skeleton className="w-150 h-6" />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Skeleton className="w-full h-25" />
                <Skeleton className="w-full h-25" />
                <Skeleton className="w-full h-25" />
            </div>

            <div className="mt-10">
                <Skeleton className="w-full h-100" />
            </div>
        </div>
    )
}