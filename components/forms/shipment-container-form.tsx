import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { TextField } from "../ui/text-field";
import { FormLabel } from "../ui/form-label"
import { Label } from "../ui/label";
import { fieldError } from "@/lib/form-field";
import {
  containerNumberSchema,
  containerSizeSchema,
  sealNumberSchema,
} from "@/lib/schemas/shipment-container";
import { zodOnChange } from "@/lib/zod-form";
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
                                    onChange: zodOnChange(containerNumberSchema),
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Container Number"
                                            required
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field 
                                name="sealNumber"
                                validators={{
                                    onChange: zodOnChange(sealNumberSchema),
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Seal Number"
                                            required
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="size" validators={{ onChange: zodOnChange(containerSizeSchema) }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <FormLabel htmlFor={field.name} className="my-2" required>Container Size</FormLabel>
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
                                                <em className="text-xs text-[var(--mli-on-error-container)]">{field.state.meta.errors}</em>
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
                        <Button variant="ghost" size="icon"><IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" /></Button>
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