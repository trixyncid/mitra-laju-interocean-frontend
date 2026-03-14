import { Row } from "@tanstack/react-table";
import CustomerForm from "../forms/customer-form";
import { Customer } from "@/app/dashboard/customers/columns";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogDescription, DialogFooter, DialogClose, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useDeleteCustomer } from "@/hooks/use-customers";

export default function CustomerActionCell({ row }: { row: Row<Customer> }) {
    const deleteCustomer = useDeleteCustomer()
    const [open, setOpen] = useState(false)

    return (
        <div className="flex items-center gap-x-2">
            <CustomerForm mode="edit" customerCode={row.original.customerCode} customerName={row.original.customerName} npwp={row.original.npwp} isActive={row.original.isActive} id={row.original.id} />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon"><IconTrash className="text-red-500 hover:bg-red-50" /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Customer</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you sure you want to delete this customer? This action cannot be undone.
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => {
                            deleteCustomer.mutate(row.original.id ?? "", {
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