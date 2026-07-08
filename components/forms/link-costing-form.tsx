"use client"

import { useForm } from "@tanstack/react-form"
import { Button } from "../ui/button"
import { IconLink, IconLinkOff, IconTrash } from "@tabler/icons-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "../ui/dialog"
import { Label } from "../ui/label"
import { useUpdateCosting, useDeleteCosting } from "@/hooks/use-costings"
import { useState } from "react"
import { useShipments } from "@/hooks/use-shipments"
import { Shipment } from "@/app/dashboard/shipments/columns"
import { usePermissions } from "@/hooks/use-permissions"
import { shipmentSelectionSchema } from "@/lib/schemas/link"
import { zodOnChange } from "@/lib/zod-form"
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

export default function LinkCostingForm({
    id,
    shipmentId,
}: {
    id: string
    shipmentId: string | undefined
}) {
    const [open, setOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const { canReadShipmentsForCosting } = usePermissions()

    const { data: shipmentsPage, isLoading, error: errorShipments } = useShipments(
        {
            page: 1,
            pageSize: 100,
            status: "all",
        },
        open && canReadShipmentsForCosting()
    )

    const deleteCosting = useDeleteCosting()
    const updateCosting = useUpdateCosting()

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
            <Dialog open={open} onOpenChange={setOpen} modal={false}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <IconLink />
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
                        <DialogTitle>Link Costing</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            <form.Field
                                name="shipmentId"
                                validators={{ onChange: zodOnChange(shipmentSelectionSchema) }}
                            >
                                {(field) => (
                                    <div className="my-5">
                                        <Label className="my-2">Shipment Order Number</Label>
                                        {isLoading ? (
                                            <p className="text-sm text-muted-foreground">Loading shipments...</p>
                                        ) : errorShipments ? (
                                            <p className="text-sm text-[var(--mli-on-error-container)]">Error loading shipments</p>
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
                        <IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" />
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
