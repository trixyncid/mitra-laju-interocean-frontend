"use client"

import { useForm } from "@tanstack/react-form"
import { Button } from "../ui/button"
import { IconLink, IconLinkOff } from "@tabler/icons-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useUpdateSelling } from "@/hooks/use-sellings"
import { useState } from "react"
import { useShipments } from "@/hooks/use-shipments"
import { Shipment } from "@/app/dashboard/shipments/columns"

export default function LinkSellingShipmentForm({
    sellingId,
    shipmentId,
}: {
    sellingId: string
    shipmentId: string | undefined
}) {
    const [open, setOpen] = useState(false)

    const { data: shipments, isLoading: isLoadingShipments, error: errorShipments } = useShipments()
    const updateSelling = useUpdateSelling()

    const form = useForm({
        defaultValues: {
            shipmentId: shipmentId ?? "",
        },
        onSubmit: async ({ value }) => {
            updateSelling.mutate({
                id: sellingId,
                selling: { shipmentId: value.shipmentId }
            }, {
                onSuccess: () => {
                    setOpen(false)
                    form.reset()
                }
            })
        }
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <IconLink className="mr-1 size-4" />
                    {shipmentId ? "Change Shipment" : "Link Shipment"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Link to Shipment</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                }}>
                    <div>
                        <form.Field
                            name="shipmentId"
                            validators={{ onChange: ({ value }) => !value ? "Shipment is required" : undefined }}
                        >
                            {(field) => (
                                <div className="my-5">
                                    <Label htmlFor={field.name} className="my-2">Shipment Order Number</Label>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(value) => field.handleChange(value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a shipment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isLoadingShipments ? (
                                                <SelectItem value="-">Loading...</SelectItem>
                                            ) : errorShipments ? (
                                                <SelectItem value="-">Error loading shipments</SelectItem>
                                            ) : shipments?.length === 0 ? (
                                                <SelectItem value="-">No shipments found</SelectItem>
                                            ) : shipments.map((shipment: Shipment) => (
                                                <SelectItem key={shipment.id} value={shipment.id ?? ""}>
                                                    {shipment.orderNumber}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {field.state.meta.errors ? (
                                        <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                    ) : null}
                                </div>
                            )}
                        </form.Field>
                    </div>
                    <DialogFooter>
                        {shipmentId && (
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={updateSelling.isPending}
                                onClick={() => {
                                    updateSelling.mutate({
                                        id: sellingId,
                                        selling: { shipmentId: null }
                                    }, {
                                        onSuccess: () => setOpen(false)
                                    })
                                }}
                            >
                                <IconLinkOff className="mr-1 size-4" />Unlink
                            </Button>
                        )}
                        <Button type="submit" disabled={updateSelling.isPending}>
                            {updateSelling.isPending ? "Linking..." : "Link Shipment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
