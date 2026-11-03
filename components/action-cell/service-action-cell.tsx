"use client"

import ServiceForm from "../forms/service-form";
import { Row } from "@tanstack/react-table";
import { Service } from "@/app/dashboard/services/columns";
import { useDeleteService } from "@/hooks/use-services";
import { usePermissions } from "@/hooks/use-permissions";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogDescription, DialogFooter, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/ui/delete-confirm-button";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";

export default function ServiceActionCell({ row }: { row: Pick<Row<Service>, "original"> }) {
    const { can } = usePermissions()
    const deleteService = useDeleteService()
    const [open, setOpen] = useState(false)
    const service = row.original

    return (
        <div className="flex items-center gap-x-2">
            {can("SERVICE", "edit") ? (
                <ServiceForm
                    mode="edit"
                    serviceCode={service.serviceCode}
                    serviceName={service.serviceName}
                    isActive={service.isActive}
                    id={service.id}
                />
            ) : null}
            {can("SERVICE", "delete") ? (
                <Dialog open={open} onOpenChange={(next) => { if (deleteService.isPending) return; setOpen(next) }}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${service.serviceName}`}>
                            <IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Service</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                            Delete {service.serviceName}? Services already used on shipments cannot be deleted; set them to inactive instead.
                        </DialogDescription>
                        <DialogFooter>
                            <DeleteConfirmButton
                                isPending={deleteService.isPending}
                                onClick={() => {
                                    deleteService.mutate(service.id ?? "", {
                                        onSuccess: () => setOpen(false),
                                    })
                                }}
                            />
                            <DialogClose asChild>
                                <Button variant="secondary" disabled={deleteService.isPending}>Cancel</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}
        </div>
    )
}
