"use client"

import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { use } from "react"
import ShipmentOperationalForm from "@/components/forms/shipment-operational-form"
import { useShipmentById } from "@/hooks/use-shipments"
import DetailPageSkeleton from "@/components/detail-page-skeleton"
import { formatDate } from "@/lib/utils"
import ShipmentContainerForm from "@/components/forms/shipment-container-form"

export type ShipmentOperationalContainer = {
    id: string
    containerNumber: string
    sealNumber: string
    size: string
    isActive: boolean
    updatedAt: string
    updatedBy: { name: string}
}


export default function ShipmentDetailPage({ params }: { params: Promise<{ shipmentId: string }> }) {
    const { shipmentId } = use(params)

    const sizeMapping = {
        "RF_20": "20 RF",
        "RF_40": "40 RF",
        "DRY_20": "20 DRY",
        "DRY_40": "40 DRY",
    }

    const { data, isLoading, error } = useShipmentById(shipmentId)


    if (isLoading) return <DetailPageSkeleton />

    console.log("Shipment detail data", data)
    console.log("Shipment Operational", data?.shipmentOperational === null)

    return (
        <div className="px-4 lg:px-6">
            <Button asChild variant="ghost" className="text-slate-500">
                <Link href={`/dashboard/shipments`}>
                    <IconArrowLeft className="text-2xl"/> Back to shipments
                </Link>
            </Button>

            <div className="flex flex-row items-start justify-between gap-x-4 my-8">
                <div>
                    <h1 className="text-2xl font-bold">Order Number { data.orderNumber }</h1>
                    <p className="text-slate-500">{ data.shipmentOperational === null ? "No shipment detail yet" : `Shipment detail last updated on  ${formatDate(data.shipmentOperational.updatedAt.split("T")[0])} by ${ data.shipmentOperational.updatedBy.name as string}` }</p>
                </div>
                <div>
                    {
                        data?.shipmentOperational === null ? (
                            <ShipmentOperationalForm mode="create" id={undefined} shipmentId={data.id} shipmentType={undefined} portDepartureId={undefined} portDestinationId={undefined} loadingLocationId={undefined} unloadingLocationId={undefined} blNumber={undefined} bookingNumber={undefined} customerCodeId={data?.customerCodeId} vesselId={undefined} eta={undefined} />
                        ) : (
                            <ShipmentOperationalForm mode="edit" id={data.shipmentOperational.id} shipmentId={data.id} shipmentType={data.shipmentOperational.shipmentType} portDepartureId={data.shipmentOperational.portDepartureId} portDestinationId={data.shipmentOperational.portDestinationId} loadingLocationId={data.shipmentOperational.loadingLocationId} unloadingLocationId={data.shipmentOperational.unloadingLocationId} blNumber={data.shipmentOperational.blNumber} bookingNumber={data.shipmentOperational.bookingNumber} customerCodeId={data?.customerCodeId} vesselId={data.shipmentOperational.vesselId} eta={data.shipmentOperational.eta} />
                        )
                    }
                </div>
            </div>
            
            {
                data?.shipmentOperational === null ? (
                    <div>
                        <p>No shipment operational data found</p>
                    </div>
                ) : (
                    <div className="flex flex-start gap-x-4">
                        <div className="w-9/12">
                            <Card className="my-6">
                                <CardHeader>
                                    <CardTitle>SHIPMENT OVERVIEW</CardTitle>
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
                                    <div>
                                        <table className="w-full text-left">
                                            <thead className="text-slate-500 border-b bg-slate-100 text-sm">
                                                <tr>
                                                    <th className="py-2 px-4">COST ID</th>
                                                    <th className="py-2 px-4">VENDOR</th>
                                                    <th className="py-2 px-4">AMOUNT</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="py-2 px-4">COST001</td>
                                                    <td className="py-2 px-4">VENDOR001</td>
                                                    <td className="py-2 px-4">Rp. 100.000</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <p className="font-semibold">Total Cost: Rp. 100.000</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="w-3/12">
                            <Card className="my-6">
                                <CardHeader>
                                    <CardTitle>FINANCIAL SUMMARY</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <div className="py-2 flex items-center justify-between border-b">
                                            <Label className="text-slate-500">Total Vendor Cost</Label>
                                            <p className="font-semibold text-red-500">- Rp. 100.000</p>
                                        </div>
                                        <div className="py-2 flex items-center justify-between border-b">
                                            <Label className="text-slate-500">Customer Charge</Label>
                                            <p className="font-semibold">Rp. 100.000</p>
                                        </div>
                                        <div className="py-2 flex items-center justify-between border-b">
                                            <Label className="text-slate-500 font-bold">Gross Profit</Label>
                                            <p className="font-semibold text-green-500">+ Rp. 100.000</p>
                                        </div>
                                        <div className="py-2 flex items-center justify-between">
                                            <Label className="text-slate-500">Margin</Label>
                                            <p className="font-semibold">18.6%</p>
                                        </div>
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