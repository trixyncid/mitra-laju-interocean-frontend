"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEdit } from "@tabler/icons-react"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"

export type Vendor = {
    vendorCode: string
    vendorName: string
    npwp: string | null
    isActive: boolean
}

export const columns: ColumnDef<Vendor>[] = [
    {
        accessorKey: "vendorCode",
        header: "Vendor Code"
    },
    {
        accessorKey: "vendorName",
        header: "Vendor Name"
    },
    {
        accessorKey: "npwp",
        header: "NPWP",
        cell: ({ row }) => {
            return <div className="">{ row.original.npwp === null ? "" : `${ row.original.npwp }`}</div>
        }
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
                                    <DialogTitle>Edit Vendor</DialogTitle>
                                </DialogHeader>
                                <div>
                                    <div className="my-3">
                                        <Label htmlFor="vendorCode" className="my-2">Vendor Code</Label>
                                        <Input name="vendorCode" />
                                    </div>
                                    <div className="my-3">
                                        <Label htmlFor="vendorName" className="my-2">Vendor Name</Label>
                                        <Input name="vendorName" />
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