"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

import Link from "next/link"

import { IconEdit, IconInfoCircle } from "@tabler/icons-react"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"


export type Shipment = {
    id: string
    orderNumber: string
    customerCode: string
    customerShipper: string
    isActive: boolean
}

export const columns: ColumnDef<Shipment>[] = [
    {
        accessorKey: "orderNumber",
        header: "Order Number"
    },
    {
        accessorKey: "customerCode",
        header: "Customer Code"
    },
    {
        accessorKey: "customerShipper",
        header: "Customer Shipper",
        enableGlobalFilter: false,
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            return <div className={clsx("px-3 py-1 w-fit rounded-full border font-semibold", row.original.isActive ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500")}>{ row.original.isActive ? "Active" : "Inactive" }</div>
        },
        enableGlobalFilter: false,
    },
    {
        accessorKey: "",
        header: "Action",
        cell: ({ row }) => {
            return (
                <div className="flex items-center">
                    <Dialog>
                        <form>
                            <DialogTrigger asChild>
                                <Button><IconEdit /></Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Port</DialogTitle>
                                </DialogHeader>
                                <div>
                                    <div className="my-3">
                                        <Label htmlFor="orderNumber" className="my-2">Order Number</Label>
                                        <Input name="orderNumber" />
                                    </div>
                                    <div className="my-3">
                                        <Label htmlFor="customerCode" className="my-2">Customer Code</Label>
                                        <Select>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select customer code" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Customer Name (Code)</SelectLabel>
                                                    <SelectItem value="value">Apple</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="my-3">
                                        <Label htmlFor="customerCode" className="my-2">Shipper</Label>
                                        <Select>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select customer shipper" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Customer Name (Code)</SelectLabel>
                                                    <SelectItem value="value">Apple</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white">Delete</Button>
                                    <Button type="submit">Save Changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </form>
                    </Dialog>
  
                    <Button asChild className="ml-3">
                        <Link href={`/dashboard/shipments/${row.original.id}`}>
                            <IconInfoCircle />
                        </Link>
                    </Button>                    
                </div>
            )
        },
    },
]