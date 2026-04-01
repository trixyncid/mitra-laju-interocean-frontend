import { Row } from "@tanstack/react-table";
import ShipmentForm from "../forms/shipment-form";
import { Shipment } from "@/app/dashboard/shipments/columns";
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { IconTrash } from "@tabler/icons-react";
import { useDeleteShipment } from "@/hooks/use-shipments";

// Create action cell page
export default function ShipmentActionCell({ row }: { row: Row<Shipment> }) {
    const [open, setOpen] = useState(false)
    const deleteShipment = useDeleteShipment()

    return (
        <div className="flex items-center gap-x-2">
            <ShipmentForm mode="edit" id={row.original.id} orderNumber={row.original.orderNumber} customerCodeId={row.original.customerCodeId} customerShipperId={row.original.customerShipperId} />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon"><IconTrash className="text-red-500 hover:bg-red-50" /></Button>
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