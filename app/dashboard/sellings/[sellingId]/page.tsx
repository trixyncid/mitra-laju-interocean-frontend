"use client"

import { use } from "react"
import Link from "next/link"
import clsx from "clsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { IconArrowLeft, IconLinkOff } from "@tabler/icons-react"
import { useSellingById, useUpdateSelling } from "@/hooks/use-sellings"
import { useUpdateCosting } from "@/hooks/use-costings"
import { useQueryClient } from "@tanstack/react-query"
import { sellingNetAmount, localDate, amountCalculation } from "@/lib/utils"
import SellingForm from "@/components/forms/selling-form"
import LinkSellingCostingForm from "@/components/forms/link-selling-costing-form"
import SellingLoading from "@/components/loading/selling-loading"
import { toast } from "sonner"
import { DashboardPage } from "@/components/layout/dashboard-page"

type LinkedCosting = {
    id: string
    costingNumber: string
    description: string
    price: number
    currency: number
    vatPercentage: number
    pph23Percentage: number
    vendor: { vendorName: string }
}

export default function SellingDetailPage({ params }: { params: Promise<{ sellingId: string }> }) {
    const { sellingId } = use(params)

    const { data: selling, isLoading, error } = useSellingById(sellingId)
    const updateSelling = useUpdateSelling()
    const updateCosting = useUpdateCosting()
    const queryClient = useQueryClient()

    if (isLoading) return <SellingLoading />
    if (error) return <DashboardPage><div className="text-destructive">Error: {error.message}</div></DashboardPage>

    const totalFromCostings =
        selling?.costings?.reduce(
            (acc: number, c: LinkedCosting) =>
                acc + amountCalculation(c.price, c.currency, c.vatPercentage, c.pph23Percentage),
            0
        ) ?? 0

    const net = sellingNetAmount(selling?.amount ?? 0, selling?.vatPercentage ?? 0, selling?.pph23Percentage ?? 0)

    return (
        <DashboardPage>
            <Button asChild variant="ghost" className="text-muted-foreground mb-2">
                <Link href="/dashboard/sellings">
                    <IconArrowLeft /> Back to sellings
                </Link>
            </Button>

            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Selling — {selling?.sellingNumber}</h1>
                    <p className="text-muted-foreground text-sm">
                        Last modified on {localDate(selling?.updatedAt)} by {selling?.updatedBy?.name}
                    </p>
                </div>
                <div className="flex items-center gap-x-2">
                    <Button
                        size="sm"
                        onClick={() => {
                            updateSelling.mutate({
                                id: sellingId,
                                selling: { status: selling?.status === "unpaid" ? "paid" : "unpaid" }
                            }, {
                                onSuccess: () => toast.success("Status updated"),
                                onError: (err: Error) => toast.error(err.message)
                            })
                        }}
                        disabled={updateSelling.isPending}
                    >
                        {updateSelling.isPending ? "Updating..." : selling?.status === "unpaid" ? "Mark as Paid" : "Mark as Unpaid"}
                    </Button>
                    <SellingForm
                        mode="edit"
                        id={sellingId}
                        sellingNumber={selling?.sellingNumber}
                        description={selling?.description}
                        amount={selling?.amount}
                        vatPercentage={selling?.vatPercentage}
                        pph23Percentage={selling?.pph23Percentage}
                    />
                </div>
            </div>

            <div className="flex items-start gap-x-4">
                {/* Left column */}
                <div className="min-w-0 flex-1 space-y-4 lg:w-[75%]">

                    {/* Selling Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-x-2">
                                SELLING DETAILS
                                <span className={clsx("text-xs font-normal rounded-md px-2 py-1",
                                    selling?.status === "paid"
                                        ? "text-secondary-foreground bg-secondary"
                                        : "text-[var(--mli-on-warning-container)] bg-[var(--mli-warning-container)]"
                                )}>
                                    {selling?.status === "paid" ? "Paid" : "Unpaid"}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-x-4">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">SELLING NUMBER</Label>
                                        <p className="font-semibold text-blue-600">{selling?.sellingNumber}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">DESCRIPTION</Label>
                                        <p className="font-semibold">{selling?.description}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">LINKED SHIPMENT</Label>
                                        {selling?.shipment === null ? (
                                            <div className="flex items-center gap-x-1 text-muted-foreground">
                                                <IconLinkOff className="size-3.5" />
                                                <p className="text-sm">Not linked</p>
                                            </div>
                                        ) : (
                                            <p className="font-semibold text-blue-600">{selling?.shipment?.orderNumber}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">VAT</Label>
                                        <p className="font-semibold">{selling?.vatPercentage}%</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">PPH 23</Label>
                                        <p className="font-semibold">{selling?.pph23Percentage}%</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Linked Costings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>LINKED COSTINGS</span>
                                <LinkSellingCostingForm sellingId={sellingId} />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selling?.costings || selling.costings.length === 0 ? (
                                <div className="flex items-center gap-x-2 text-muted-foreground">
                                    <IconLinkOff className="size-4 animate-pulse" />
                                    <p className="text-sm">No costings linked to this selling yet.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="text-muted-foreground border-b bg-muted text-xs">
                                        <tr>
                                            <th className="py-2 px-4">COSTING #</th>
                                            <th className="py-2 px-4">DESCRIPTION</th>
                                            <th className="py-2 px-4">VENDOR</th>
                                            <th className="py-2 px-4">AMOUNT (Rp)</th>
                                            <th className="py-2 px-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selling.costings.map((costing: LinkedCosting) => (
                                            <tr key={costing.id} className="border-b last:border-0">
                                                <td className="py-2 px-4 font-medium">{costing.costingNumber}</td>
                                                <td className="py-2 px-4 text-sm">{costing.description}</td>
                                                <td className="py-2 px-4 text-sm">{costing.vendor?.vendorName}</td>
                                                <td className="py-2 px-4 text-sm">
                                                    {amountCalculation(costing.price, costing.currency, costing.vatPercentage, costing.pph23Percentage)
                                                        .toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                                                </td>
                                                <td className="py-2 px-4">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-[var(--mli-on-error-container)] hover:text-red-600 hover:bg-[var(--mli-error-container)]"
                                                        disabled={updateCosting.isPending}
                                                        onClick={() => {
                                                            updateCosting.mutate(
                                                                { id: costing.id, costing: { sellingId: null } },
                                                                {
                                                                    onSuccess: () => {
                                                                        queryClient.invalidateQueries({ queryKey: ["sellings", sellingId] })
                                                                        toast.success("Costing unlinked")
                                                                    },
                                                                    onError: (err: Error) => toast.error(err.message),
                                                                }
                                                            )
                                                        }}
                                                    >
                                                        <IconLinkOff className="size-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right column — Amount Summary */}
                <div className="w-full shrink-0 lg:w-[25%]">
                    <Card>
                        <CardContent>
                            <div className="mb-4 pt-2">
                                <h1 className="font-bold">AMOUNT SUMMARY</h1>
                            </div>

                            <div className="mb-4">
                                <h4 className="text-sm text-muted-foreground text-center">Net Selling Amount (Rp)</h4>
                                <h2 className="font-bold text-2xl text-center text-blue-600">
                                    { net.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                                </h2>
                            </div>

                            <div className="border rounded-md">
                                <div className="flex items-center justify-between py-3 px-2 border-b">
                                    <p className="text-sm">Gross Selling Amount</p>
                                    <p className="font-semibold text-sm">
                                        { (Number(selling?.amount)).toLocaleString("id-ID", { style: "currency", currency: "IDR" }) }
                                    </p>
                                </div>

                                <div className="flex items-center justify-between py-3 px-2 border-b">
                                    <p className="text-sm">Costing Amount</p>
                                    <p className="font-semibold text-sm">
                                        {totalFromCostings.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between py-3 px-2 border-b">
                                    <p className="text-sm">VAT</p>
                                    <p className={clsx("text-sm", selling?.vatPercentage === 0 ? "px-2 py-0.5 bg-[var(--mli-warning-container)] text-[var(--mli-on-warning-container)] rounded-full" : "font-semibold")}>
                                        {selling?.vatPercentage !== 0 ? `${selling?.vatPercentage}%` : "Not applicable"}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between py-3 px-2 border-b">
                                    <p className="text-sm">PPH 23</p>
                                    <p className="font-semibold text-sm">{selling?.pph23Percentage}%</p>
                                </div>

                                {/* Revenue */}
                                <div className="flex items-center justify-between py-3 px-2 border-b">
                                    <p className="text-sm">Revenue</p>
                                    <p className={clsx(`font-semibold text-sm`, net - totalFromCostings > 0 ? "text-secondary-foreground" : "text-[var(--mli-on-error-container)]")}>
                                        {(net - totalFromCostings).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardPage>
    )
}
