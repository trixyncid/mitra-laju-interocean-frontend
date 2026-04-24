import { Skeleton } from "../ui/skeleton";

export default function CustomerVendorDetailLoading() {
    return (
        <div className="px-4 lg:px-6">
            <Skeleton className="w-50 h-5 mb-5" />
            <Skeleton className="w-full h-50 mb-5" />
            <Skeleton className="w-100 h-5 mb-5" />
            <div className="flex items-center justify-between">
                <Skeleton className="w-50 h-5 mb-5" />
                <Skeleton className="w-30 h-5 mb-5" />
            </div>
            <Skeleton className="w-full h-30 mb-5" />
        </div>
    )
}