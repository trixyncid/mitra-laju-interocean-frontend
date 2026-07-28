"use client"

import { useForm } from "@tanstack/react-form"
import { Button } from "../ui/button"
import { DeleteConfirmButton } from "../ui/delete-confirm-button"
import { IconLink, IconLinkOff, IconTrash } from "@tabler/icons-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "../ui/dialog"
import { useUpdateCosting, useDeleteCosting } from "@/hooks/use-costings"
import { useState } from "react"
import { useShipments } from "@/hooks/use-shipments"
import { Shipment } from "@/app/dashboard/shipments/columns"
import { usePermissions } from "@/hooks/use-permissions"
import { shipmentSelectionSchema } from "@/lib/schemas/link"
import { zodOnChange } from "@/lib/zod-form"
import { SearchableCombobox } from "@/components/searchable-combobox"
import { fieldError } from "@/lib/form-field"

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

    const shipmentItems =
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
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon-sm" aria-label="Link costing">
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
                                        <SearchableCombobox
                                            id={field.name}
                                            label="Shipment Order Number"
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            items={shipmentItems}
                                            error={fieldError(field.state.meta.errors)}
                                            required
                                            isLoading={isLoading}
                                            disabled={Boolean(errorShipments)}
                                            placeholder="Search shipment order number..."
                                            emptyMessage={
                                                errorShipments
                                                    ? "Unable to load shipments."
                                                    : "No shipments found."
                                            }
                                        />
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
                            <Button type="submit" disabled={updateCosting.isPending}>
                                {updateCosting.isPending ? "Linking..." : "Link Costing"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={(next) => { if (deleteCosting.isPending) return; setDeleteOpen(next) }}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Delete costing">
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
                        <DeleteConfirmButton
                            isPending={deleteCosting.isPending}
                            onClick={() => {
                                deleteCosting.mutate(id, {
                                    onSuccess: () => {
                                        setDeleteOpen(false)
                                    }
                                })
                            }}
                        />
                        <DialogClose asChild>
                            <Button variant="secondary" disabled={deleteCosting.isPending}>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
