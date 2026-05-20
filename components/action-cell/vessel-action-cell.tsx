import { Row } from "@tanstack/react-table";
import { Vessel } from "@/app/dashboard/vessels/columns";
import VesselForm from "../forms/vessel-form";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogDescription, DialogFooter, DialogClose, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { IconTrash } from "@tabler/icons-react";
import { useDeleteVessel } from "@/hooks/use-vessels";
import { useState } from "react";
import { usePermissions } from "@/hooks/use-permissions";

export default function VesselActionCell({ row }: { row: Row<Vessel> }) {
    const { canWrite } = usePermissions()
    const deleteVessel = useDeleteVessel()
    const [open, setOpen] = useState(false)

    if (!canWrite("masterData")) return null

    return (
        <div className="flex items-center gap-x-2">
            <VesselForm mode="edit" vesselName={row.original.vesselName} voyageNumber={row.original.voyageNumber} etd={row.original.etd ?? undefined} closingReefer={row.original.closingReefer ?? undefined} isActive={row.original.isActive} id={row.original.id ?? undefined} />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon"><IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Vessel</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you sure you want to delete this vessel? This action cannot be undone.
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => {
                            deleteVessel.mutate(row.original.id ?? "", {
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
};