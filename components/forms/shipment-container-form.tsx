import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/ui/delete-confirm-button";
import { useForm } from "@tanstack/react-form";
import { TextField } from "../ui/text-field";
import { FormLabel } from "../ui/form-label"
import { fieldError } from "@/lib/form-field";
import {
  containerNumberSchema,
  containerSizeSchema,
  containerTypeSchema,
  sealNumberSchema,
} from "@/lib/schemas/shipment-container";
import { zodOnChange } from "@/lib/zod-form";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../ui/select";
import { useMemo, useState } from "react";
import { useCreateShipmentOperationalContainer, useDeleteShipmentOperationalContainer, useUpdateShipmentOperationalContainer } from "@/hooks/use-shipments";
import { useContainerLookups } from "@/hooks/use-container-lookups";
import type { ContainerLookup } from "@/app/dashboard/containers/columns";

function optionsFor(
    items: ContainerLookup[],
    selectedId: string | undefined
) {
    return items.filter((item) => item.isActive || item.id === selectedId)
}

export default function ShipmentContainerForm({
    mode,
    containerNumber,
    sealNumber,
    containerSizeId,
    containerTypeId,
    shipmentOperationalId,
    shipmentId,
    id
}: {
    mode: "edit" | "create",
    containerNumber: string | undefined,
    sealNumber: string | undefined,
    containerSizeId: string | undefined,
    containerTypeId: string | undefined,
    shipmentOperationalId?: string | undefined,
    shipmentId?: string | undefined,
    id?: string | undefined,
}) {
    const [ open, setOpen ] = useState(false)
    const [ openDelete, setOpenDelete ] = useState(false)

    const createShipmentOperationalContainer = useCreateShipmentOperationalContainer(shipmentId ?? "")
    const updateShipmentOperationalContainer = useUpdateShipmentOperationalContainer(shipmentId ?? "")
    const deleteShipmentOperationalContainer = useDeleteShipmentOperationalContainer(shipmentId ?? "")

    const { data: sizesData, isLoading: sizesLoading } = useContainerLookups(
        "size",
        { page: 1, pageSize: 100, status: "all" },
        open
    )
    const { data: typesData, isLoading: typesLoading } = useContainerLookups(
        "type",
        { page: 1, pageSize: 100, status: "all" },
        open
    )

    const sizeOptions = useMemo(
        () => optionsFor(sizesData?.items ?? [], containerSizeId),
        [sizesData?.items, containerSizeId]
    )
    const typeOptions = useMemo(
        () => optionsFor(typesData?.items ?? [], containerTypeId),
        [typesData?.items, containerTypeId]
    )

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            shipmentOperationalId: shipmentOperationalId ?? "",
            shipmentId: shipmentId ?? "",
            containerNumber: containerNumber ?? "",
            sealNumber: sealNumber ?? "",
            containerSizeId: containerSizeId ?? "",
            containerTypeId: containerTypeId ?? "",
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
                        containerSizeId: value.containerSizeId,
                        containerTypeId: value.containerTypeId,
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
                            <form.Field name="containerSizeId" validators={{ onChange: zodOnChange(containerSizeSchema) }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <FormLabel htmlFor={field.name} className="my-2" required>Container Size</FormLabel>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={(value) => field.handleChange(value)}
                                            disabled={sizesLoading}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={sizesLoading ? "Loading sizes..." : "Select a container size"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sizeOptions.map((size) => (
                                                    <SelectItem key={size.id} value={size.id ?? ""}>
                                                        {size.name}
                                                    </SelectItem>
                                                ))}
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
                            <form.Field name="containerTypeId" validators={{ onChange: zodOnChange(containerTypeSchema) }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <FormLabel htmlFor={field.name} className="my-2" required>Container Type</FormLabel>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={(value) => field.handleChange(value)}
                                            disabled={typesLoading}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={typesLoading ? "Loading types..." : "Select a container type"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {typeOptions.map((type) => (
                                                    <SelectItem key={type.id} value={type.id ?? ""}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
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
                <Dialog open={openDelete} onOpenChange={(next) => { if (deleteShipmentOperationalContainer.isPending) return; setOpenDelete(next) }}>
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
                            <DeleteConfirmButton
                                isPending={deleteShipmentOperationalContainer.isPending}
                                onClick={() => {
                                    deleteShipmentOperationalContainer.mutate({
                                        shipmentId: shipmentId ?? "",
                                        shipmentOperationalId: shipmentOperationalId ?? "",
                                        id: id ?? "",
                                    })
                                }}
                            />
                            <DialogClose asChild>
                                <Button variant="secondary" disabled={deleteShipmentOperationalContainer.isPending}>Cancel</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}
        </div>
    )
}
