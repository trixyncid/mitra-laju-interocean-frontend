"use client"

import { useForm } from "@tanstack/react-form"
import { Button } from "../ui/button"
import { IconLink, IconLinkOff } from "@tabler/icons-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Label } from "../ui/label"
import { useUpdateSelling } from "@/hooks/use-sellings"
import { useState } from "react"
import { useShipments } from "@/hooks/use-shipments"
import { Shipment } from "@/app/dashboard/shipments/columns"
import { shipmentSelectionSchema } from "@/lib/schemas/link"
import { zodOnChange } from "@/lib/zod-form"
import { SearchableCombobox } from "@/components/searchable-combobox"
import { fieldError } from "@/lib/form-field"

export default function LinkSellingShipmentForm({
    sellingId,
    shipmentId,
}: {
    sellingId: string
    shipmentId: string | undefined
}) {
    const [open, setOpen] = useState(false)

    const { data: shipmentsPage, isLoading } = useShipments({
        page: 1,
        pageSize: 100,
        status: "all",
    })
    const updateSelling = useUpdateSelling()

    type ComboItem = { value: string; label: string }
    const shipmentItems: ComboItem[] =
        shipmentsPage?.items.map((s: Shipment) => ({
            value: s.id ?? "",
            label: s.orderNumber,
        })) ?? []

    const form = useForm({
        defaultValues: {
            shipmentId: shipmentId ?? "",
        },
        onSubmit: async ({ value }) => {
            updateSelling.mutate(
                { id: sellingId, selling: { shipmentId: value.shipmentId } },
                {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    },
                }
            )
        },
    })

    return (
        <Dialog open={open} onOpenChange={setOpen} modal={false}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <IconLink className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent
                onInteractOutside={(e) => {
                    const target = e.target as Element
                    if (target.closest('[data-slot="combobox-content"]')) {
                        e.preventDefault()
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>Link to Shipment</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                >
                    <div>
                        <form.Field
                            name="shipmentId"
                            validators={{
                                onChange: zodOnChange(shipmentSelectionSchema),
                            }}
                        >
                            {(field) => (
                                <div className="my-5">
                                    <SearchableCombobox
                                        id={field.name}
                                        label="Shipment Order Number"
                                        value={field.state.value}
                                        onValueChange={(nextValue) => field.handleChange(nextValue)}
                                        items={shipmentItems}
                                        error={fieldError(field.state.meta.errors)}
                                        required
                                        isLoading={isLoading}
                                        placeholder="Search shipment order number..."
                                        emptyMessage="No shipments found."
                                    />
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
                                    updateSelling.mutate(
                                        { id: sellingId, selling: { shipmentId: null } },
                                        { onSuccess: () => setOpen(false) }
                                    )
                                }}
                            >
                                <IconLinkOff className="mr-1 size-4" /> Unlink
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
