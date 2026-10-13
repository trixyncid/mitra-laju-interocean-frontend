import { Skeleton } from "../ui/skeleton";

export default function TableSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 max-w-xl rounded-md border border-[rgba(var(--mli-tint-rgb),0.35)] bg-[rgba(var(--mli-tint-rgb),0.35)]" />
            <Skeleton className="h-64 w-full rounded-md border border-[rgba(var(--mli-tint-rgb),0.35)] bg-[rgba(var(--mli-tint-rgb),0.35)]" />
        </div>
    )
}
