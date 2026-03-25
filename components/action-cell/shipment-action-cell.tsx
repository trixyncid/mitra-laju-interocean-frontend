import { Row } from "@tanstack/react-table";
import ShipmentForm from "../forms/shipment-form";
import { Shipment } from "@/app/dashboard/shipments/columns";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { IconTrash } from "@tabler/icons-react";

// Create action cell page
export default function ShipmentActionCell({ row }: { row: Row<Shipment> }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="flex items-center gap-x-2">
            <ShipmentForm mode="edit" orderNumber={row.original.orderNumber} customerCode={row.original.customerCode} customerShipper={row.original.customerShipper} />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon"><IconTrash className="text-red-500 hover:bg-red-50" /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Shipment</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you sure you want to delete this shipment? This action cannot be undone.
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="destructive">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}