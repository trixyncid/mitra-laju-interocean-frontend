import { Skeleton } from "../ui/skeleton";
import { DashboardPage } from "@/components/layout/dashboard-page";

export default function CustomerVendorDetailLoading() {
    return (
        <DashboardPage>
            <Skeleton className="mb-6 h-10 w-48" />
            <Skeleton className="h-48 w-full rounded-[2rem]" />
            <Skeleton className="mt-6 h-96 w-full rounded-[2rem]" />
        </DashboardPage>
    )
}
