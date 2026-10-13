"use client"

import { useRouter } from "next/navigation"
import { IconArrowUpRight, IconCopy, IconLayoutColumns, IconPencil, IconTrash } from "@tabler/icons-react"
import type { Row } from "@tanstack/react-table"
import { toast } from "sonner"

import ShipmentForm from "../forms/shipment-form"
import type { Shipment } from "@/app/dashboard/shipments/columns"
import { RowActions } from "@/components/row-actions/row-actions"
import { ShipmentDetailPanel } from "@/components/shipments/shipment-detail-panel"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/use-permissions"
import { useDeleteShipment } from "@/hooks/use-shipments"
import { shipmentReference } from "@/lib/shipment-reference"

export default function ShipmentActionCell({ row }: { row: Pick<Row<Shipment>, "original"> }) {
    const router = useRouter()
    const { canWrite, canWriteShipmentType } = usePermissions()
    const deleteShipment = useDeleteShipment()

    const shipment = row.original
    const id = shipment.id ?? ""
    const shipmentType = shipment.shipmentOperational?.shipmentType
    const canEdit = shipmentType ? canWriteShipmentType(shipmentType) : canWrite("shipments")
    const reference =
        shipment.shipmentOperational?.bookingNumber?.trim() || shipment.shipmentOperational?.blNumber?.trim() || ""
    const name = shipmentReference(shipment)

    return (
        <RowActions
            name={name}
            primary={
                canEdit ? (
                    <ShipmentForm
                        id={shipment.id}
                        customerCodeId={shipment.customerCodeId}
                        customerShipperId={shipment.customerShipperId}
                        status={shipment.status}
                        isActive={shipment.isActive}
                        trigger={
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                title="Edit"
                                aria-label={`Edit ${name}`}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <IconPencil className="size-4" />
                            </Button>
                        }
                    />
                ) : null
            }
            quickLook={(close) => (
                <ShipmentDetailPanel shipmentId={id} onClose={close} onDeleted={close} className="h-full" />
            )}
            menu={[
                [
                    { label: "Open full page", icon: <IconArrowUpRight />, href: `/dashboard/shipments/${id}` },
                    {
                        label: "Open in split view",
                        icon: <IconLayoutColumns />,
                        onSelect: () => {
                            router.push(`/dashboard/shipments?shipment=${id}`)
                        },
                    },
                    reference
                        ? { label: "Copy booking / BL number", icon: <IconCopy />, copy: reference }
                        : { label: "Copy booking / BL number", icon: <IconCopy />, disabled: true, hint: "No booking or BL number yet" },
                ],
                [
                    canEdit && {
                        label: "Delete shipment",
                        icon: <IconTrash />,
                        tone: "danger",
                        confirm: {
                            title: "Delete this shipment?",
                            description: `${name} and everything linked to it will be removed. This cannot be undone.`,
                            onConfirm: () =>
                                deleteShipment.mutateAsync(id).catch((error: Error) => {
                                    toast.warning(error.message)
                                    throw error
                                }),
                        },
                    },
                ],
            ]}
        />
    )
}
