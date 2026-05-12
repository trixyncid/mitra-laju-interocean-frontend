"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import SellingForm from "@/components/forms/selling-form"
import { useSellings } from "@/hooks/use-sellings"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"

export default function SellingPage() {
    const { data: sellings, isLoading, error } = useSellings()

    if (error) return <ErrorPage />

    return (
        <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Selling Entries</h1>
                    <p>Manage all selling entries and link them to shipments.</p>
                </div>
                <SellingForm
                    mode="create"
                    id={undefined}
                    sellingNumber={undefined}
                    description={undefined}
                    amount={undefined}
                    vatPercentage={undefined}
                    pph23Percentage={undefined}
                />
            </div>
            <div className="container mx-auto py-10">
                {isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={sellings} />}
            </div>
        </div>
    )
}
