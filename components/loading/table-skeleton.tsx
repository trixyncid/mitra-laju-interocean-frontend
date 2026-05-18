import { Skeleton } from "../ui/skeleton";

export default function TableSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-11 max-w-xl rounded-full" />
            <Skeleton className="h-64 w-full rounded-md" />
        </div>
    )
}
