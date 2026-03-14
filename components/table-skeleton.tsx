import { Skeleton } from "./ui/skeleton";

export default function TableSkeleton() {
    return (
        <div>
            <div className="mt-4">
                <Skeleton className="h-8 w-100" />
            </div>

            <div className="mt-4">
                <Skeleton className="h-100 w-full" />
            </div>
        </div>
    )
}