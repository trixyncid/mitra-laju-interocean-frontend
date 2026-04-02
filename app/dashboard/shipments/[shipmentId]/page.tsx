"use client"

import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"


export default function ShipmentDetailPage() {
    return (
        <div className="px-4 lg:px-6">
            <Button asChild variant="ghost" className="text-slate-500">
                <Link href={`/dashboard/shipments`}>
                    <IconArrowLeft className="text-2xl"/> Back to shipments
                </Link>
            </Button>

            <div className="my-8">
                <div>
                    <h1>Shipment ID / Order Number</h1>
                    <p>Last updated on [date] by [name]</p>
                </div>
                <div>
                    {/* Shipment Operational Form */}
                    
                </div>
            </div>

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
                                        <p className="font-semibold text-blue-600">1/IV/2026</p>
                                    </div>

                                    <div className="my-4">
                                        <Label className="text-xs text-slate-500">CONTAINER NUMBER</Label>
                                        <p className="font-semibold text-blue-600">
                                            CONTAINER001
                                        </p>
                                    </div>

                                    <div className="my-4">
                                        <Label className="text-xs text-slate-500">ORIGIN PORT</Label>
                                        <p className="font-semibold">SINGAPORE</p>
                                    </div>
                                </div>

                                {/* Right Side */}
                                <div>
                                    <div>
                                        <Label className="text-xs text-slate-500">CUSTOMER</Label>
                                        <p className="font-semibold">ASDF</p>
                                    </div>

                                    <div className="my-4">
                                        <Label className="text-xs text-slate-500">ASSIGNED VESSEL</Label>
                                        <p className="font-semibold">Vessel Number 001</p>
                                    </div>

                                    <div className="my-4">
                                        <Label className="text-xs text-slate-500">DESTINATION PORT</Label>
                                        <p className="font-semibold">INDONESIA</p>

                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="my-6">
                        <CardHeader>
                            <CardTitle>CONTAINER DETAILS</CardTitle>
                            <div>
                                {/* Shipment Container Form */}
                            </div>
                        </CardHeader>
                        <CardContent>
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
                                        <tr className="border-b">
                                            <td className="py-2 px-4">CNTR001</td>
                                            <td className="py-2 px-4">SEAL001</td>
                                            <td className="py-2 px-4">20 RF</td>
                                            <td className="py-2 px-4">Winsten Coellins</td>
                                            <td className="py-2 px-4">Jan 1, 2026</td>
                                            <td className="py-2 px-4">
                                                
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
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
        </div>
    )
}