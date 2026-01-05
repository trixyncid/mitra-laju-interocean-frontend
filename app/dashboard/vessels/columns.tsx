"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEdit } from "@tabler/icons-react"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"

export type Vessel = {
    vesselName: string
    voyage: string
    etd: string
    closingReefer: string
    isActive: boolean
}

export const columns: ColumnDef<Vessel>[] = [
    {
        accessorKey: "vesselName",
        header: "Vessel Name"
    },
    {
        accessorKey: "voyage",
        header: "Voyage"
    },
    {
        accessorKey: "etd",
        header: "ETD"
    },
    {
        accessorKey: "closingReefer",
        header: "Closing Reefer"
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
                                        <Label htmlFor="portName" className="my-2">Vessel Name</Label>
                                        <Input name="portName" type="text"/>
                                    </div>
                                    <div className="my-3">
                                        <Label htmlFor="country" className="my-2">Voyage</Label>
                                        <Input name="country" type="text"/>
                                    </div>
                                    <div className="my-3">
                                        <Label htmlFor="country" className="my-2">ETD</Label>
                                        <Input name="etd" type="date" />
                                    </div>
                                    <div className="my-3">
                                        <Label htmlFor="country" className="my-2">Closing Reefer</Label>
                                        <Input name="country" type="date"/>
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