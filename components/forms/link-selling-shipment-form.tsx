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
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxValue,
} from "@/components/ui/combobox"

export default function LinkSellingShipmentForm({
    sellingId,
    shipmentId,
}: {
    sellingId: string
    shipmentId: string | undefined
}) {
    const [open, setOpen] = useState(false)

    const { data: shipments, isLoading } = useShipments()
    const updateSelling = useUpdateSelling()

    type ComboItem = { value: string; label: string }
    const shipmentItems: ComboItem[] =
        shipments?.map((s: Shipment) => ({
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
                                onChange: ({ value }) => !value ? "Please select a shipment" : undefined,
                            }}
                        >
                            {(field) => (
                                <div className="my-5">
                                    <Label className="my-2">Shipment Order Number</Label>
                                    {isLoading ? (
                                        <p className="text-sm text-muted-foreground">Loading shipments...</p>
                                    ) : (
                                        <Combobox
                                            items={shipmentItems}
                                            value={shipmentItems.find((item) => item.value === field.state.value) ?? null}
                                            onValueChange={(item) => field.handleChange(item?.value ?? "")}
                                            isItemEqualToValue={(a, b) => a.value === b.value}
                                        >
                                            <ComboboxTrigger
                                                render={
                                                    <Button type="button" variant="outline" className="w-full justify-between font-normal">
                                                        <ComboboxValue placeholder="Search shipment order number..." />
                                                    </Button>
                                                }
                                            />
                                            <ComboboxContent>
                                                <ComboboxInput showTrigger={false} placeholder="Search..." />
                                                <ComboboxEmpty>No shipments found.</ComboboxEmpty>
                                                <ComboboxList>
                                                    {(item) => (
                                                        <ComboboxItem key={item.value} value={item}>
                                                            {item.label}
                                                        </ComboboxItem>
                                                    )}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                    )}
                                    {field.state.meta.errors ? (
                                        <em className="text-xs text-[var(--mli-on-error-container)]">{field.state.meta.errors}</em>
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
