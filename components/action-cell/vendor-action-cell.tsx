import { Vendor } from "@/app/dashboard/vendors/columns";
import VendorForm from "../forms/vendor-form";
import { Row } from "@tanstack/react-table";
import { Dialog, DialogDescription, DialogTitle, DialogHeader, DialogContent, DialogTrigger, DialogFooter, DialogClose } from "../ui/dialog";
import { Button } from "../ui/button";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useDeleteVendor } from "@/hooks/use-vendors";

export default function VendorActionCell({ row }: { row: Row<Vendor> }) {
    const [open, setOpen] = useState(false)
    const deleteVendor = useDeleteVendor()

    return (
        <div className="flex gap-x-2">
            <VendorForm mode="edit" id={row.original.id} vendorName={row.original.vendorName} vendorCode={row.original.vendorCode} npwp={row.original.npwp ?? undefined} isActive={row.original.isActive} />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon"><IconTrash className="text-red-500 hover:bg-red-50" /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Vendor</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you sure you want to delete this vendor? This action cannot be undone.
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => {
                            deleteVendor.mutate({ id: row.original.id ?? "" }, {
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