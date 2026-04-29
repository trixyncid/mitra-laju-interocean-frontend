"use client"

import { useForm } from "@tanstack/react-form"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { IconPencil, IconPlus } from "@tabler/icons-react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useEffect, useState } from "react"
import { useGetShipmentOperationalContainers } from "@/hooks/use-shipments"
import { useVendors } from "@/hooks/use-vendors"
import { ShipmentOperationalContainer } from "@/app/dashboard/shipments/[shipmentId]/page"
import { Vendor } from "@/app/dashboard/vendors/columns"
import { useCreateCosting, useUpdateCosting } from "@/hooks/use-costings"

export default function CostingForm({
    mode,
    id,
    costingNumber,
    description,
    price,
    currency,
    containerId,
    vatPercentage,
    pph23Percentage,
    vendorInvoiceNumber,
    vendorId,
}: {
    mode: "edit" | "create"
    id: string | undefined,
    costingNumber: string | undefined,
    description: string | undefined,
    price: number | undefined,
    currency: number | undefined,
    containerId: string | undefined,
    vatPercentage: number | undefined,
    pph23Percentage: number | undefined,
    vendorInvoiceNumber: string | undefined,
    vendorId: string | undefined,
}) {
    const [ open, setOpen ] = useState(false)

    const createCosting = useCreateCosting()
    const updateCosting = useUpdateCosting()

    const { data: shipmentOperationalContainers, isLoading: isLoadingShipmentOperationalContainers, error: errorShipmentOperationalContainers } = useGetShipmentOperationalContainers()
    const { data: vendors, isLoading: isLoadingVendors, error: errorVendors } = useVendors()

    const form = useForm({
        defaultValues: {
            costingNumber: costingNumber ?? "",
            description: description ?? "",
            price: price ?? "",
            currency: currency ?? "",
            containerId: containerId ?? "-",
            vatPercentage: vatPercentage ?? "",
            pph23Percentage: pph23Percentage ?? "",
            vendorInvoiceNumber: vendorInvoiceNumber ?? "",
            vendorId: vendorId ?? "-",
        },
        onSubmit: async ({ value }) => {
            if (mode === "create") {
                createCosting.mutate({
                    costingNumber: value.costingNumber,
                    description: value.description,
                    price: Number(value.price),
                    currency: Number(value.currency),
                    containerId: value.containerId,
                    vatPercentage: Number(value.vatPercentage),
                    pph23Percentage: Number(value.pph23Percentage),
                    vendorInvoiceNumber: value.vendorInvoiceNumber,
                    vendorId: value.vendorId,
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    }
                })
            } else {
                updateCosting.mutate({
                    id: id as string,
                    costing: {
                        costingNumber: value.costingNumber,
                        description: value.description,
                        price: Number(value.price),
                        currency: Number(value.currency),
                        containerId: value.containerId,
                        vatPercentage: Number(value.vatPercentage),
                        pph23Percentage: Number(value.pph23Percentage),
                        vendorInvoiceNumber: value.vendorInvoiceNumber,
                        vendorId: value.vendorId,
                    }
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    }
                })
            }
        }
    })

    useEffect(() => {
        if (mode === "create" && costingNumber) {
            form.setFieldValue("costingNumber", costingNumber)
        }
    }, [costingNumber, form, mode])

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    { mode === "edit" ? <Button size="icon"><IconPencil /></Button> : <Button><IconPlus /> Add Costing</Button>}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ mode === "edit" ? "Edit Costing" : "Add Costing"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            <form.Field
                                name="costingNumber"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Costing Number is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Costing Number</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} disabled={true} />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="description" validators={{ onChange: ({ value }) => !value ? "Description is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Description</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="price" validators={{ onChange: ({ value }) => !value ? "Price is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Price</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} type="number" step="0.01" />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="currency" validators={{ onChange: ({ value }) => !value ? "Currency is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Currency</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} type="number" step="0.01" />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="containerId" validators={{ onChange: ({ value }) => value === "-" ? "Container is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Container Number</Label>
                                        <Select
                                            value={field.state.value as string}
                                            onValueChange={(value) => field.handleChange(value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a container number" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    isLoadingShipmentOperationalContainers ? (
                                                        <SelectItem value="-">Loading...</SelectItem>
                                                    ) : errorShipmentOperationalContainers ? (
                                                        <SelectItem value="-">Error loading containers</SelectItem>
                                                    ) : shipmentOperationalContainers?.length === 0 ? (
                                                        <SelectItem value="-">No containers found</SelectItem>
                                                    ) : shipmentOperationalContainers.map((container: ShipmentOperationalContainer) => (
                                                        <SelectItem key={container.id} value={container.id as string}>{container.containerNumber} ({container.sealNumber})</SelectItem>
                                                    ))
                                                }
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
                            <form.Field 
                                name="vatPercentage"
                                validators={{ onChange: ({ value }) => value === "" ? "VAT is required. Input zero if not applicable" : Number(value) > 100 ? "VAT must be less than or equal to 100" : undefined }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">VAT (%)</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} type="number" step="0.01" />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field 
                                name="pph23Percentage"
                                validators={{ onChange: ({ value }) => value === "" ? "PPH 23 is required. Input zero if not applicable" : Number(value) > 100 ? "PPH 23 must be less than or equal to 100" : undefined }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">PPH 23 (%)</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} type="number" step="0.01" />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="vendorInvoiceNumber" validators={{ onChange: ({ value }) => !value ? "Vendor Invoice Number is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Vendor Invoice Number</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="vendorId" validators={{ onChange: ({ value }) => value === "-" ? "Vendor is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Vendor</Label>
                                        <Select
                                            value={field.state.value as string}
                                            onValueChange={(value) => field.handleChange(value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a vendor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    isLoadingVendors ? (
                                                        <SelectItem value="-">Loading...</SelectItem>
                                                    ) : errorVendors ? (
                                                        <SelectItem value="-">Error loading vendors</SelectItem>
                                                    ) : vendors?.length === 0 ? (
                                                        <SelectItem value="-">No vendors found</SelectItem>
                                                    ) : vendors?.map((vendor: Vendor) => (
                                                        <SelectItem key={vendor.id} value={vendor.id ?? "-"}>{vendor.vendorName}</SelectItem>
                                                    ))
                                                }
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
                            <Button type="submit" disabled={createCosting.isPending || updateCosting.isPending}>{ mode === "edit" ? (updateCosting.isPending ? "Updating..." : "Save Changes") : (createCosting.isPending ? "Creating..." : "Create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}