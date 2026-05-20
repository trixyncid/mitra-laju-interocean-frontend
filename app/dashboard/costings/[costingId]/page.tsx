"use client"

import { Button } from "@/components/ui/button";
import { IconEye, IconFile } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { use } from "react";
import { useCostingById, useUpdateCosting } from "@/hooks/use-costings";
import { amountCalculation, formatDate } from "@/lib/utils";
import DocumentUploadForm from "@/components/forms/document-upload-form";
import { costingService } from "@/services/costing.service";
import CostingLoading from "@/components/loading/costing-loading";
import { toast } from "sonner";
import clsx from "clsx";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { CostingWriteGate } from "@/components/write-gates";
import ErrorPage from "@/components/error-page";

export type CostingAttachment = {
    id: string
    attachmentName: string
    fileName: string
    filePath: string
    createdAt: string
    createdBy: string
    updatedAt: string
    updatedBy: { name: string }
}

export default function CostingDetailPage({ params }: { params: Promise<{ costingId: string }> }) {
    const { costingId } = use(params)

    const updateCosting = useUpdateCosting()

    const { data: costing, isLoading: isLoadingCosting, error: errorCosting } = useCostingById(costingId)

    if (isLoadingCosting) return <CostingLoading />

    if (errorCosting) return <ErrorPage message={errorCosting.message} />

    if (!costing) return <ErrorPage title="Costing not found" message="Unable to load this costing." />

    const attachments = costing.costingsAttachments ?? []
    const price = Number(costing.price) || 0
    const currency = Number(costing.currency) || 0
    const vatPercentage = Number(costing.vatPercentage) || 0
    const pph23Percentage = Number(costing.pph23Percentage) || 0

    return (
        <DashboardPage>
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Costing Number - {costing?.costingNumber}</h1>
                    <p className="text-muted-foreground text-sm">
                        Last modified on{" "}
                        {costing.updatedAt ? formatDate(costing.updatedAt.split("T")[0]) : "—"}
                        {costing.updatedBy?.name ? ` by ${costing.updatedBy.name}` : ""}
                    </p>
                </div>

                <CostingWriteGate>
                    <Button size="sm" onClick={() => {
                        updateCosting.mutate({
                            id: costingId,
                            costing: {
                                status: costing?.status === "unpaid" ? "paid" : "unpaid"
                            }
                        }, {
                            onSuccess: () => {
                                toast.success("Costing status updated successfully")
                            },
                            onError: (error: Error) => {
                                toast.error(error.message)
                            }
                        })
                    }} disabled={updateCosting.isPending}>{ updateCosting.isPending ? "Updating..." : costing?.status === "unpaid" ? "Mark as Paid" : "Mark as Unpaid"}</Button>
                </CostingWriteGate>
            </div>

            {/* Costing Detail */}
            
            <div className="flex items-start justify-between gap-x-4">
                <div className="w-9/12">
                    <Card>
                        <CardContent>
                            <h1 className="font-bold mb-4">COSTING DETAILS <span className={clsx("text-xs mx-2 font-normal", costing?.status === "paid" ? "text-secondary-foreground bg-secondary rounded-md px-2 py-1" : "text-[var(--mli-on-warning-container)] bg-[var(--mli-warning-container)] rounded-md px-2 py-1")}>{ costing?.status === "paid" ? "Paid" : "Unpaid" }</span></h1>
                            
                            <div className="grid grid-cols-2 gap-x-4">
                                <div>
                                    <div className="mb-4">
                                        <p className="text-sm text-muted-foreground">VENDOR</p>
                                        <p className="font-semibold">{costing.vendor?.vendorName ?? "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">CONTAINER NUMBER</p>
                                        <p className="font-semibold">{costing.container?.containerNumber ?? "—"}</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-4">
                                        <p className="text-sm text-muted-foreground">VENDOR INVOICE NUMBER</p>
                                        <p className="font-semibold">{costing?.vendorInvoiceNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">DESCRIPTION</p>
                                        <p className="font-semibold">{costing?.description}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents */}
                    <Card className="my-4">
                        <CardContent>
                            <div className="mb-4 flex items-center justify-between">
                                <h1 className="font-bold">SUPPORTING DOCUMENTS</h1>
                                <CostingWriteGate>
                                    <DocumentUploadForm mode="create" module="costing" shipmentId={undefined} costingId={costingId} id={undefined} attachmentName={undefined} document={undefined} />
                                </CostingWriteGate>
                            </div>

                            {
                                attachments.length === 0 ? (
                                    <div>
                                        <p>No documents available ...</p>
                                    </div>
                                ) :
                                attachments.map((attachment: CostingAttachment) => (
                                    <div key={attachment.id} className="border rounded-md px-3 py-2 flex items-center gap-x-2 justify-between mb-4">
                                        <div className="flex items-center gap-x-2">
                                            <IconFile className="text-ring bg-blue-100 rounded-md p-1 size-8" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">{ attachment.attachmentName } - { attachment.fileName }</p>
                                                <p className="text-xs text-muted-foreground">Last modified: { formatDate(attachment.updatedAt.split("T")[0]) }{ attachment.updatedBy?.name ? ` by ${attachment.updatedBy.name}` : "" }</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => costingService.viewCostingAttachment(costingId, attachment.id!)}
                                            >
                                                <IconEye className="text-muted-foreground size-4" />
                                            </Button>
                                            <CostingWriteGate>
                                                <DocumentUploadForm mode="edit" module="costing" shipmentId={undefined} costingId={costingId} id={attachment.id} attachmentName={attachment.attachmentName} document={undefined} />
                                            </CostingWriteGate>
                                        </div>
                                    </div>
                                ))
                            }
                        </CardContent>
                    </Card>
                </div>

                <div className="w-3/12">
                    <Card>
                        <CardContent>
                            <div className="mb-4">
                                <h1 className="font-bold">AMOUNT SUMMARY</h1>
                            </div>

                            <div className="mb-4">
                                <h4 className="text-sm text-muted-foreground text-center">TOTAL COST (Rp)</h4>
                                <h2 className="font-bold text-2xl text-center text-blue-600">
                                    {amountCalculation(price, currency, vatPercentage, pph23Percentage).toLocaleString("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                    })}
                                </h2>
                            </div>

                            <div className="border rounded-md">
                                <div className="flex items-center justify-between py-3 px-2 border-b">
                                    <p>Price</p>
                                    <p>{price.toLocaleString("id-ID")}</p>
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 border-b">
                                    <p>Currency</p>
                                    <p>{currency.toLocaleString("id-ID")}</p>
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 border-b">
                                    <p>VAT</p>
                                    <p className={`${vatPercentage !== 0 ? "" : "px-2 py-1 bg-[var(--mli-warning-container)] text-[var(--mli-on-warning-container)] rounded-full"}`}>
                                        {vatPercentage !== 0 ? vatPercentage : "Not applicable"}%
                                    </p>
                                </div>
                                <div className="flex items-center justify-between py-3 px-2">
                                    <p>PPH23</p>
                                    <p>{pph23Percentage}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardPage>
    )
}