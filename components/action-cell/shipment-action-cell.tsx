import { Row } from "@tanstack/react-table";
import ShipmentForm from "../forms/shipment-form";
import { Shipment } from "@/app/dashboard/shipments/columns";
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { IconTrash } from "@tabler/icons-react";
import { useDeleteShipment } from "@/hooks/use-shipments";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/use-permissions";

export default function ShipmentActionCell({ row }: { row: Row<Shipment> }) {
    const { canWrite, canWriteShipmentType } = usePermissions()
    const [open, setOpen] = useState(false)
    const deleteShipment = useDeleteShipment()

    const shipmentType = row.original.shipmentOperational?.shipmentType
    const canEdit = shipmentType
        ? canWriteShipmentType(shipmentType)
        : canWrite("shipments")

    if (!canEdit) return null

    return (
        <div className="flex items-center gap-x-2">
            <ShipmentForm mode="edit" id={row.original.id} orderNumber={row.original.orderNumber} customerCodeId={row.original.customerCodeId} customerShipperId={row.original.customerShipperId} isActive={row.original.isActive} />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon"><IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Shipment</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you sure you want to delete this shipment? This action cannot be undone and will delete all related data.
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => {
                            deleteShipment.mutate(row.original.id ?? "", {
                                onSuccess: () => {
                                    setOpen(false)
                                },
                                onError: (error: Error) => {
                                    console.log("Error: ", error)
                                    toast.warning(error.message)
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