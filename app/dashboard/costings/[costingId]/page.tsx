"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { use } from "react";
import { useCostingById } from "@/hooks/use-costings";
import { amountCalculation, formatDate } from "@/lib/utils";

export default function CostingDetailPage({ params }: { params: Promise<{ costingId: string }> }) {
    const { costingId } = use(params)

    const { data: costing, isLoading: isLoadingCosting, error: errorCosting } = useCostingById(costingId)

    console.log(costing)

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Cost Entry: #CST-2026-001</h1>
                    <p className="text-slate-400 text-sm">Last modified on { formatDate(costing?.updatedAt?.split("T")[0]) } by {costing?.updatedBy?.name}</p>
                </div>

                <div className="flex items-center justify-between gap-x-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive"><IconTrash /> Delete</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Permanent Delete</DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                                Are you sure you want to delete the costing? Once this action is performed you will not be able to restore this costing.
                            </DialogDescription>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" variant="destructive">Delete</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* <CostingForm mode="edit" description="Trucking Fee" price={123000} currency={15000} containerNumber="CNTR001" vat={10} pph23={1} vendorInvoiceNumber="INV-001-2025" vendorName="1" />     */}
                </div>
            </div>

            {/* Costing Detail */}
            
            <div className="flex items-start justify-between gap-x-4">
                <div className="w-9/12">
                    <Card>
                        <CardContent>
                            <h1 className="font-bold mb-4">COSTING DETAILS</h1>
                            
                            <div className="grid grid-cols-2 gap-x-4">
                                <div>
                                    <div className="mb-4">
                                        <p className="text-sm text-slate-500">VENDOR</p>
                                        <p className="font-semibold">{costing?.vendor.vendorName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">CONTAINER NUMBER</p>
                                        <p className="font-semibold">{costing?.container.containerNumber}</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-4">
                                        <p className="text-sm text-slate-500">VENDOR INVOICE NUMBER</p>
                                        <p className="font-semibold">{costing?.vendorInvoiceNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">DESCRIPTION</p>
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
                                <Button variant="outline"><IconPlus /> Upload</Button>
                            </div>

                            <div>
                                <p>No documents available ...</p>
                            </div>
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
                                <h4 className="text-sm text-slate-500 text-center">TOTAL COST (Rp)</h4>
                                <h2 className="font-bold text-2xl text-center text-blue-600">Rp { amountCalculation(costing?.price, costing?.currency, costing?.vatPercentage, costing?.pph23Percentage).toLocaleString("id-ID") }</h2>
                            </div>

                            <div className="border rounded-md">
                                <div className="flex items-center justify-between py-3 px-2 border-b">
                                    <p>Price</p>
                                    <p>{ costing?.price.toLocaleString() }</p>
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 border-b">
                                    <p>Currency</p>
                                    <p>{ costing?.currency }</p>
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 border-b">
                                    <p>VAT</p>
                                    <p className={`${costing?.vatPercentage !== 0 ? "" : "px-2 py-1 bg-orange-100 text-orange-500 rounded-full"}`}>{ costing?.vatPercentage !== 0 ? costing?.vatPercentage : "Not applicable" }%</p>
                                </div>
                                <div className="flex items-center justify-between py-3 px-2">
                                    <p>PPH23</p>
                                    <p>{ costing?.pph23Percentage }%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}