"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEdit } from "@tabler/icons-react"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"

export type Customer = {
    customerCode: string
    customerName: string
    npwp: string
    isActive: boolean
}

export const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: "customerCode",
        header: "Customer Code"
    },
    {
        accessorKey: "customerName",
        header: "Customer Name"
    },
    {
        accessorKey: "npwp",
        header: "NPWP",
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            return <div className={clsx("px-3 py-1 w-fit rounded-full border font-semibold", row.original.isActive ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500")}>{ row.original.isActive ? "Active" : "Inactive" }</div>
        }
    },
    {
        accessorKey: "",
        header: "Action",
        cell: ({  }) => {
            return (
                <div>
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
                                        <Label htmlFor="customerCode" className="my-2">Customer Code</Label>
                                        <Input name="customerCode" />
                                    </div>
                                    <div className="my-3">
                                        <Label htmlFor="customerName" className="my-2">Customer Name</Label>
                                        <Input name="customerName" />
                                    </div>
                                    <div className="my-3">
                                        <Label htmlFor="npwp" className="my-2">NPWP</Label>
                                        <Input name="npwp" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white">Delete</Button>
                                    <Button type="submit">Save Changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </form>
                    </Dialog>
                </div>
            )
        }
    },
]