"use client"

import { useForm } from "@tanstack/react-form"
import { Button } from "../ui/button"
import { IconLink, IconLinkOff, IconTrash } from "@tabler/icons-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "../ui/dialog"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useUpdateCosting, useDeleteCosting } from "@/hooks/use-costings"
import { useState } from "react"
import { useShipments } from "@/hooks/use-shipments"
import { Shipment } from "@/app/dashboard/shipments/columns"

export default function LinkCostingForm({
    id,
    shipmentId,
}: {
    id: string
    shipmentId: string | undefined
}) {
    const [open, setOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    const { data: shipments, isLoading: isLoadingShipments, error: errorShipments } = useShipments()

    const deleteCosting = useDeleteCosting()
    const updateCosting = useUpdateCosting()

    const form = useForm({
        defaultValues: {
            shipmentId: shipmentId ?? "",
        },
        onSubmit: async ({ value }) => {
            updateCosting.mutate({
                id: id,
                costing: {
                    shipmentId: value.shipmentId,
                }
            }, {
                onSuccess: () => {
                    setOpen(false)
                    form.reset()
                }
            })
        }
    })

    return (
        <div className="flex items-center gap-x-2">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <IconLink />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Link Costing</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            <form.Field name="shipmentId" validators={{ onChange: ({ value }) => !value ? "Shipment Order Number is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-5">
                                        <Label htmlFor={field.name} className="my-2">Shipment Order Number</Label>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={(value) => field.handleChange(value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a shipment order number" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    isLoadingShipments ? (
                                                        <SelectItem value="-">Loading...</SelectItem>
                                                    ) : errorShipments ? (
                                                        <SelectItem value="-">Error loading shipments</SelectItem>
                                                    ) : shipments?.length === 0 ? (
                                                        <SelectItem value="-">No shipments found</SelectItem>
                                                    ) : shipments.map((shipment: Shipment) => (
                                                        <SelectItem key={shipment.id} value={shipment.id ?? ""}>{shipment.orderNumber}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={updateCosting.isPending}
                                onClick={() => {
                                    updateCosting.mutate({
                                        id: id,
                                        costing: { shipmentId: null }
                                    }, {
                                        onSuccess: () => {
                                            setOpen(false)
                                            form.reset()
                                        }
                                    })
                                }}
                            >
                                <IconLinkOff />Unlink
                            </Button>
                            <Button type="submit" disabled={updateCosting.isPending}>{ updateCosting.isPending ? "Linking..." : "Link Costing" }</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <IconTrash className="text-red-500 hover:bg-red-50" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Costing</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you sure you want to delete this costing? This action cannot be undone.
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => {
                            deleteCosting.mutate(id, {
                                onSuccess: () => {
                                    setDeleteOpen(false)
                                }
                            })
                        }}>Delete</Button>
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}