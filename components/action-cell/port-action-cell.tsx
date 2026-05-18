import PortForm from "../forms/port-form";
import { Row } from "@tanstack/react-table";
import { Port } from "@/app/dashboard/ports/columns";
import { useDeletePort } from "@/hooks/use-ports";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogDescription, DialogFooter, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";

export default function PortActionCell({ row }: { row: Row<Port> }) {
    const deletePort = useDeletePort()
    const [open, setOpen] = useState(false)

    return (
        <div className="flex items-center gap-x-2">
            <PortForm mode="edit" portName={row.original.portName} portCountry={row.original.portCountry} isActive={row.original.isActive} id={row.original.id} />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon"><IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Port</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you sure you want to delete this port? This action cannot be undone.
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => {
                            deletePort.mutate(row.original.id ?? "", {
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