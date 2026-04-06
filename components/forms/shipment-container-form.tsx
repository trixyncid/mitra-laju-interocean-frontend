import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";
import { useCreateShipmentOperationalContainer, useDeleteShipmentOperationalContainer, useUpdateShipmentOperationalContainer } from "@/hooks/use-shipments";

export default function ShipmentContainerForm({
    mode,
    containerNumber,
    sealNumber,
    size,
    shipmentOperationalId,
    shipmentId,
    id
}: {
    mode: "edit" | "create",
    containerNumber: string | undefined,
    sealNumber: string | undefined,
    size: string | undefined,
    shipmentOperationalId?: string | undefined,
    shipmentId?: string | undefined,
    id?: string | undefined,
}) {
    const [ open, setOpen ] = useState(false)
    const [ openDelete, setOpenDelete ] = useState(false)

    const createShipmentOperationalContainer = useCreateShipmentOperationalContainer(shipmentId ?? "")
    const updateShipmentOperationalContainer = useUpdateShipmentOperationalContainer(shipmentId ?? "")
    const deleteShipmentOperationalContainer = useDeleteShipmentOperationalContainer(shipmentId ?? "")

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            shipmentOperationalId: shipmentOperationalId ?? "",
            shipmentId: shipmentId ?? "",
            containerNumber: containerNumber ?? "",
            sealNumber: sealNumber ?? "",
            size: size ?? "",
        },
        onSubmit: ({ value }) => {
            if (mode === "create") {
                createShipmentOperationalContainer.mutate({
                    shipmentId: shipmentId ?? "",
                    shipmentOperationalId: shipmentOperationalId ?? "",
                    shipmentOperationalContainer: value,
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    }
                })
            } else {
                updateShipmentOperationalContainer.mutate({
                    shipmentId: shipmentId ?? "",
                    shipmentOperationalId: shipmentOperationalId ?? "",
                    id: id ?? "",
                    shipmentOperationalContainer: {
                        containerNumber: value.containerNumber,
                        sealNumber: value.sealNumber,
                        size: value.size,
                    },
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    }
                })
            }
        }
    })

    return (
        <div className="flex items-center gap-x-2">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    { mode === "edit" ? <Button variant="outline" size="icon"><IconPencil /></Button> : <Button variant="outline"><IconPlus /> Container</Button>}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{mode === "edit" ? "Edit Shipment Container": "Create New Shipment Container"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            <form.Field 
                                name="containerNumber"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Container Number is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Container Number</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field 
                                name="sealNumber"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Seal Number is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Seal Number</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="size" validators={{ onChange: ({ value }) => !value ? "Container Size is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Container Size</Label>
                                        <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a container size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="RF_20">20 RF</SelectItem>  
                                                <SelectItem value="RF_40">40 RF</SelectItem>
                                                <SelectItem value="DRY_20">20 DRY</SelectItem>
                                                <SelectItem value="DRY_40">40 DRY</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <DialogFooter>
                        <Button type="submit" disabled={ mode === "create" ? createShipmentOperationalContainer.isPending : false || mode === "edit" ? updateShipmentOperationalContainer.isPending : false}>{ mode === "edit" ? (updateShipmentOperationalContainer.isPending ? "Updating..." : "Save Changes") : (createShipmentOperationalContainer.isPending ? "Creating..." : "Create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            { mode === "edit" ? (
                <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon"><IconTrash className="text-red-500 hover:bg-red-50" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Shipment Container</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                            Are you sure you want to delete this shipment container? This action cannot be undone.
                        </DialogDescription>
                        <DialogFooter>
                            <Button variant="destructive" onClick={() => {
                                deleteShipmentOperationalContainer.mutate({
                                    shipmentId: shipmentId ?? "",
                                    shipmentOperationalId: shipmentOperationalId ?? "",
                                    id: id ?? "",
                                })
                            }}>Delete</Button>
                            <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}
        </div>
    )
}