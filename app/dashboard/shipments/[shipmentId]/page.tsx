"use client"

import { IconArrowLeft, IconEye, IconFile } from "@tabler/icons-react"
import Link from "next/link"
import { Dot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { use } from "react"
import ShipmentOperationalForm from "@/components/forms/shipment-operational-form"
import { useShipmentById, useUpdateShipmentOperational } from "@/hooks/use-shipments"
import { amountCalculation, formatDate, sellingNetAmount } from "@/lib/utils"
import ShipmentContainerForm from "@/components/forms/shipment-container-form"
import DocumentUploadForm from "@/components/forms/document-upload-form"
import { Costing } from "../../costings/columns"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useForm } from "@tanstack/react-form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useState } from "react"
import { shipmentsService } from "@/services/shipments.service"
import ShipmentLoading from "@/components/loading/shipment-loading"
import clsx from "clsx"

export type ShipmentOperationalContainer = {
    id?: string
    containerNumber: string
    sealNumber: string
    size: string
    isActive: boolean
    updatedAt: string
    updatedBy: { name: string}
}

export type ShipmentOperationalAttachment = {
    id?: string
    attachmentName: string
    filePath: string
    fileName: string
    contentType: string
    size: number
    updatedAt: string
    updatedBy: { name: string}
}

type ShipmentLinkedSelling = {
    id: string
    sellingNumber: string
    description: string
    amount: number
    vatPercentage: number
    pph23Percentage: number
    status: string
}


export default function ShipmentDetailPage({ params }: { params: Promise<{ shipmentId: string }> }) {
    const { shipmentId } = use(params)

    const sizeMapping = {
        "RF_20": "20 RF",
        "RF_40": "40 RF",
        "DRY_20": "20 DRY",
        "DRY_40": "40 DRY",
    }

    const [ open, setOpen ] = useState(false)
    
    const { data, isLoading } = useShipmentById(shipmentId)

    const sellings: ShipmentLinkedSelling[] = (data as { sellings?: ShipmentLinkedSelling[] })?.sellings ?? []

    const updateShipmentOperational = useUpdateShipmentOperational(shipmentId)

    const form = useForm({
        defaultValues: {
            customerChargeAmount: data?.shipmentOperational?.customerChargeAmount ?? "",
        },
        onSubmit: async ({ value }) => {
            updateShipmentOperational.mutate({
                shipmentId: shipmentId,
                id: data?.shipmentOperational?.id ?? "",
                shipmentOperational: {
                    customerChargeAmount: Number(value.customerChargeAmount),
                }
            }, {
                onSuccess: () => {
                    toast.success("Financial summary updated successfully")
                    setOpen(false)
                },
                onError: (error: Error) => {
                    toast.error(error.message || "Failed to update financial summary")
                }
            })
        }
    })


    if (isLoading) return <ShipmentLoading />

    return (
        <div className="px-4 lg:px-6">
            <Button asChild variant="ghost" className="text-slate-500">
                <Link href={`/dashboard/shipments`}>
                    <IconArrowLeft className="text-2xl"/> Back to shipments
                </Link>
            </Button>

            <div className="flex flex-row items-start justify-between gap-x-4 my-8">
                <div>
                    <h1 className="text-2xl font-bold">Order Number - { data.orderNumber }</h1>
                    <p className="text-slate-500">{ data.shipmentOperational === null ? "-" : `Shipment detail last updated on  ${formatDate(data.shipmentOperational.updatedAt.split("T")[0])} by ${ data.shipmentOperational.updatedBy.name as string}` }</p>
                </div>
                <div>
                    {
                        data?.shipmentOperational === null ? (
                            <ShipmentOperationalForm mode="create" id={undefined} shipmentId={data.id} shipmentType={undefined} portDepartureId={undefined} portDestinationId={undefined} loadingLocationId={undefined} unloadingLocationId={undefined} blNumber={undefined} bookingNumber={undefined} customerCodeId={data?.customerCodeId} customerShipperId={data?.customerShipperId} vesselId={undefined} eta={undefined} customerChargeAmount={undefined} status={undefined} />
                        ) : (
                            <ShipmentOperationalForm mode="edit" id={data.shipmentOperational.id} shipmentId={data.id} shipmentType={data.shipmentOperational.shipmentType} portDepartureId={data.shipmentOperational.portDepartureId} portDestinationId={data.shipmentOperational.portDestinationId} loadingLocationId={data.shipmentOperational.loadingLocationId} unloadingLocationId={data.shipmentOperational.unloadingLocationId} blNumber={data.shipmentOperational.blNumber} bookingNumber={data.shipmentOperational.bookingNumber} customerCodeId={data?.customerCodeId} customerShipperId={data?.customerShipperId} vesselId={data.shipmentOperational.vesselId} eta={data.shipmentOperational.eta} customerChargeAmount={data.shipmentOperational.customerChargeAmount} status={data.shipmentOperational.status} />
                        )
                    }
                </div>
            </div>
            
            {
                data?.shipmentOperational === null ? (
                    <div className="flex align-center justify-center">
                        <p className="">No shipment operational data found</p>
                    </div>
                ) : (
                    <div className="flex flex-start gap-x-4">
                        <div className="w-[70%]">
                            <Card className="my-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <h1>SHIPMENT OVERVIEW</h1>
                                        <p className={clsx("text-xs mx-2 font-normal", data.shipmentOperational.status === "paid" ? "text-green-500 bg-green-100 rounded-md px-2 py-1" : "text-orange-500 bg-orange-100 rounded-md px-2 py-1")}>{ data.shipmentOperational.status === "paid" ? "Paid" : "Unpaid" }</p>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-x-4">
                                        {/* Left Side */}
                                        <div>
                                            <div>
                                                <Label className="text-xs text-slate-500">SHIPMENT ORDER NUMBER</Label>
                                                <p className="font-semibold text-blue-600">{ data.orderNumber }</p>
                                            </div>

                                            <div className="my-4">
                                                <Label className="text-xs text-slate-500">CONTAINER NUMBER</Label>
                                                <p className="font-semibold text-blue-600">
                                                    CONTAINER001
                                                </p>
                                            </div>

                                            <div className="my-4">
                                                <Label className="text-xs text-slate-500">ORIGIN PORT</Label>
                                                <p className="font-semibold">{ data.shipmentOperational.portDeparture.portName as string } ({ data.shipmentOperational.portDeparture.portCountry as string })</p>
                                            </div>
                                        </div>

                                        {/* Right Side */}
                                        <div>
                                            <div>
                                                <Label className="text-xs text-slate-500">CUSTOMER</Label>
                                                <p className="font-semibold">{ data.customerCode.customerName as string } ({ data.customerCode.customerCode as string })</p>
                                            </div>

                                            <div className="my-4">
                                                <Label className="text-xs text-slate-500">ASSIGNED VESSEL</Label>
                                                <p className="font-semibold">{ data.shipmentOperational.vessel.vesselName as string } / { data.shipmentOperational.vessel.voyageNumber as string }</p>
                                            </div>

                                            <div className="my-4">
                                                <Label className="text-xs text-slate-500">DESTINATION PORT</Label>
                                                <p className="font-semibold">{ data.shipmentOperational.portDestination.portName as string } ({ data.shipmentOperational.portDestination.portCountry as string })</p>

                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="my-6">
                                <CardHeader className="flex items-center justify-between">
                                    <CardTitle>DOCUMENT UPLOADS</CardTitle>
                                    <DocumentUploadForm mode="create" module="shipment" shipmentId={data.id} costingId={undefined} id={undefined} attachmentName={undefined} document={undefined} />
                                </CardHeader>
                                <CardContent>
                                    {
                                        data?.shipmentOperationalAttachments.length === 0 ? (
                                            <div>
                                                <p>No document uploads found</p>
                                            </div>
                                        ) :
                                        data?.shipmentOperationalAttachments.map((attachment: ShipmentOperationalAttachment) => (
                                            <div key={attachment.id} className="border rounded-md px-3 py-2 flex items-center gap-x-2 justify-between mb-4">
                                                <div className="flex items-center gap-x-2">
                                                    <IconFile className="text-blue-500 bg-blue-100 rounded-md p-1 size-8" />
                                                    <div>
                                                        <p className="text-sm text-slate-500">{ attachment.attachmentName } - { attachment.fileName }</p>
                                                        <p className="text-xs text-slate-500">Last modified: { formatDate(attachment.updatedAt.split("T")[0]) } by { attachment.updatedBy.name as string }</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => shipmentsService.viewShipmentOperationalAttachment(data.id, attachment.id!)}
                                                    >
                                                        <IconEye className="text-slate-500 size-4" />
                                                    </Button>
                                                    <DocumentUploadForm mode="edit" module="shipment" shipmentId={data.id} costingId={undefined} id={attachment.id} attachmentName={attachment.attachmentName} document={undefined} />
                                                </div>
                                            </div>
                                        ))
                                    }
                                </CardContent>
                            </Card>

                            <Card className="my-6">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>CONTAINER DETAILS</CardTitle>
                                        <div>
                                            <ShipmentContainerForm mode="create" containerNumber={undefined} sealNumber={undefined} size={undefined} shipmentOperationalId={data.shipmentOperational.id} shipmentId={data.id} id={undefined} />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {
                                        data.shipmentOperational.shipmentOperationalContainers.length === 0 ? (
                                            <div>
                                                <p>No container data found</p>
                                            </div>
                                        ) : (        
                                            <div>
                                                <table className="w-full text-left">
                                                    <thead className="text-slate-500 border-b bg-slate-100 text-xs">
                                                        <tr>
                                                            <th className="py-2 px-4">CONTAINER NUMBER</th>
                                                            <th className="py-2 px-4">SEAL NUMBER</th>
                                                            <th className="py-2 px-4">SIZE</th>
                                                            <th className="py-2 px-4">LAST MODIFIED BY</th>
                                                            <th className="py-2 px-4">LAST MODIFIED AT</th>
                                                            <th className="py-2 px-4"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            data.shipmentOperational.shipmentOperationalContainers.map((container: ShipmentOperationalContainer) => (
                                                                <tr key={container.id}>
                                                                    <td className="py-2 px-4">{ container.containerNumber }</td>
                                                                    <td className="py-2 px-4">{ container.sealNumber }</td>
                                                                    <td className="py-2 px-4">{ sizeMapping[container.size as keyof typeof sizeMapping] }</td>
                                                                    <td className="py-2 px-4">{ container.updatedBy.name as string }</td>
                                                                    <td className="py-2 px-4">{ formatDate(container.updatedAt.split("T")[0]) }</td>
                                                                    <td className="py-2 px-4">
                                                                        <ShipmentContainerForm mode="edit" containerNumber={container.containerNumber} sealNumber={container.sealNumber} size={container.size} shipmentOperationalId={data.shipmentOperational.id} shipmentId={data.id} id={container.id} />
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    }
                                </CardContent>
                            </Card>

                            <Card className="my-6">
                                <CardHeader>
                                    <CardTitle>LINKED COSTINGS</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {
                                        data.costings.length === 0 ? (
                                            <div>
                                                <p>No linked costings found</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <div>
                                                    <table className="w-full text-left">
                                                        <thead className="text-slate-500 border-b bg-slate-100 text-sm">
                                                            <tr>
                                                                <th className="py-2 px-4">DESCRIPTION</th>
                                                                <th className="py-2 px-4">VENDOR</th>
                                                                <th className="py-2 px-4">AMOUNT</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {   
                                                                data.costings.map((costing: Costing) => (
                                                                    <tr key={costing.id}>
                                                                        <td className="py-2 px-4">{ costing.description }</td>
                                                                        <td className="py-2 px-4">{ costing.vendor.vendorName }</td>
                                                                        <td className="py-2 px-4">{ amountCalculation(costing.price, costing.currency, costing.vatPercentage, costing.pph23Percentage).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) }</td>
                                                                    </tr>
                                                                ))
                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="mt-4 flex justify-end">
                                                    <p className="text-sm text-slate-500">Total Cost: <span className="font-semibold">{ data.costings.reduce((acc: number, costing: Costing) => acc + amountCalculation(costing.price, costing.currency, costing.vatPercentage, costing.pph23Percentage), 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) }</span></p>
                                                </div>
                                            </div>
                                        )
                                    }
                                </CardContent>
                            </Card>

                            <Card className="my-6">
                                <CardHeader>
                                    <CardTitle>LINKED SELLINGS</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {sellings.length === 0 ? (
                                        <p>No linked sellings found</p>
                                    ) : (
                                        <div>
                                            <table className="w-full text-left">
                                                <thead className="text-slate-500 border-b bg-slate-100 text-sm">
                                                    <tr>
                                                        <th className="py-2 px-4">SELLING #</th>
                                                        <th className="py-2 px-4">DESCRIPTION</th>
                                                        <th className="py-2 px-4">NET AMOUNT (Rp)</th>
                                                        <th className="py-2 px-4">STATUS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sellings.map((selling: ShipmentLinkedSelling) => (
                                                        <tr key={selling.id}>
                                                            <td className="py-2 px-4 font-semibold text-blue-600">
                                                                <Link href={`/dashboard/sellings/${selling.id}`} className="hover:underline">
                                                                    {selling.sellingNumber}
                                                                </Link>
                                                            </td>
                                                            <td className="py-2 px-4">{selling.description}</td>
                                                            <td className="py-2 px-4">
                                                                {sellingNetAmount(selling.amount, selling.vatPercentage, selling.pph23Percentage).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                                                            </td>
                                                            <td className="py-2 px-4">
                                                                <div className={clsx("pr-3 w-fit rounded-full flex items-center text-xs", selling.status === "paid" ? "bg-green-100 text-green-500" : "bg-orange-100 text-orange-500")}>
                                                                    <Dot className="animate-pulse -mr-1" /> {selling.status === "paid" ? "Paid" : "Unpaid"}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="mt-4 flex justify-end">
                                                <p className="text-sm text-slate-500">
                                                    Total selling (net):{" "}
                                                    <span className="font-semibold">
                                                        {sellings.reduce((acc, s) => acc + sellingNetAmount(s.amount, s.vatPercentage, s.pph23Percentage), 0).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="w-[30%]">
                            <Card className="my-6">
                                <CardHeader>
                                    <CardTitle>FINANCIAL SUMMARY</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <div className="py-2 flex items-center justify-between border-b">
                                            <Label className="text-slate-500">Total Vendor Cost</Label>
                                            <p className="font-semibold text-red-500">- { data.costings.reduce((acc: number, costing: Costing) => acc + amountCalculation(costing.price, costing.currency, costing.vatPercentage, costing.pph23Percentage), 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) }</p>
                                        </div>
                                        <div className="py-2 flex items-center justify-between border-b">
                                            <Label className="text-slate-500">Customer Charge</Label>
                                            <p className="font-semibold">{ data.shipmentOperational.customerChargeAmount === null ? "Rp. 0" : data.shipmentOperational.customerChargeAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) }</p>
                                        </div>
                                        <div className="py-2 flex items-center justify-between border-b">
                                            <Label className="text-slate-500 font-bold">Gross Profit</Label>
                                            <p className="font-semibold text-green-500">{ data.shipmentOperational.customerChargeAmount === null || data.shipmentOperational.customerChargeAmount === 0 ? <span className="text-orange-500 bg-orange-100 rounded-md px-2 py-1 text-xs font-medium">Unavailable</span> : (data.shipmentOperational.customerChargeAmount - data.costings.reduce((acc: number, costing: Costing) => acc + amountCalculation(costing.price, costing.currency, costing.vatPercentage, costing.pph23Percentage), 0)).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) }</p>
                                        </div>
                                        <div className="py-2 flex items-center justify-between">
                                            <Label className="text-slate-500">Margin</Label>
                                            <p className="font-semibold">{ data.shipmentOperational.customerChargeAmount === null || data.shipmentOperational.customerChargeAmount === 0 ? <span className="text-orange-500 bg-orange-100 rounded-md px-2 py-1 text-xs font-medium">Unavailable</span> : ((data.shipmentOperational.customerChargeAmount - data.costings.reduce((acc: number, costing: Costing) => acc + amountCalculation(costing.price, costing.currency, costing.vatPercentage, costing.pph23Percentage), 0)) / data.shipmentOperational.customerChargeAmount * 100).toFixed(2) + "%" }</p>
                                        </div>
                                    </div>

                                    <div className="w-full flex justify-end mt-4">
                                        <Dialog open={open} onOpenChange={setOpen}>
                                            <DialogTrigger asChild>
                                                <Button size="sm"> Edit</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit Financial Summary</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    form.handleSubmit()
                                                }}>
                                                    <div>
                                                        <form.Field name="customerChargeAmount" validators={{ onChange: ({ value }) => !value ? "Customer charge amount is required" : undefined }}>
                                                            {( field ) => (
                                                                <div>
                                                                    <Label htmlFor={field.name} className="mb-2">Customer Charge</Label>
                                                                    <Input type="number" id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                                    {field.state.meta.errors ? (
                                                                        <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                                                    ) : null}
                                                                </div>
                                                            )}
                                                        </form.Field>
                                                    </div>
                                                    <DialogFooter className="mt-4">
                                                        <Button type="submit" disabled={updateShipmentOperational.isPending}>{ updateShipmentOperational.isPending ? "Saving..." : "Save" }</Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )
            }
        </div>
    )
}