"use client"

import { useForm } from "@tanstack/react-form"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { IconEdit, IconPlus } from "@tabler/icons-react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useState } from "react"
import { useGetShipmentOperationalContainers } from "@/hooks/use-shipments"
import { useVendors } from "@/hooks/use-vendors"
import { ShipmentOperationalContainer } from "@/app/dashboard/shipments/[shipmentId]/page"
import { Vendor } from "@/app/dashboard/vendors/columns"


export default function CostingForm({
    mode,
    description,
    price,
    currency,
    containerId,
    vat,
    pph23,
    vendorInvoiceNumber,
    vendorId,
}: {
    mode: "edit" | "create"
    description: string | undefined,
    price: number | undefined,
    currency: number | undefined,
    containerId: string | undefined,
    vat: number | undefined,
    pph23: number | undefined,
    vendorInvoiceNumber: string | undefined,
    vendorId: string | undefined,
}) {
    const [ open, setOpen ] = useState(false)

    const { data: shipmentOperationalContainers, isLoading: isLoadingShipmentOperationalContainers, error: errorShipmentOperationalContainers } = useGetShipmentOperationalContainers()
    const { data: vendors, isLoading: isLoadingVendors, error: errorVendors } = useVendors()

    const form = useForm({
        defaultValues: {
            description: description ?? "",
            price: price ?? "",
            currency: currency ?? "",
            containerId: containerId ?? "",
            vat: vat ?? "",
            pph23: pph23 ?? "",
            vendorInvoiceNumber: vendorInvoiceNumber ?? "",
            vendorId: vendorId ?? "",
        },
        onSubmit: async ({ value }) => {
            console.log(value)
        }
    })

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>{ mode === "edit" ? <><IconEdit /> Edit Costing</> : <><IconPlus /> Add Costing</>}</Button>
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
                            <form.Field name="containerId" validators={{ onChange: ({ value }) => !value ? "Container is required" : undefined }}>
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
                                                    shipmentOperationalContainers.isLoading ? (
                                                        <SelectItem value="1">Loading...</SelectItem>
                                                    ) : shipmentOperationalContainers.error ? (
                                                        <SelectItem value="1">Error loading containers</SelectItem>
                                                    ) : shipmentOperationalContainers.length === 0 ? (
                                                        <SelectItem value="1">No containers found</SelectItem>
                                                    ) : shipmentOperationalContainers.map((container: ShipmentOperationalContainer) => (
                                                        <SelectItem key={container.id} value={container.id}>{container.containerNumber}</SelectItem>
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
                                name="vat"
                                validators={{ onChange: ({ value }) => !value ? "VAT is required. Input zero if not applicable" : Number(value) > 100 ? "VAT must be less than or equal to 100" : undefined }}
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
                                name="pph23"
                                validators={{ onChange: ({ value }) => !value ? "PPH 23 is required. Input zero if not applicable" : Number(value) > 100 ? "PPH 23 must be less than or equal to 100" : undefined }}
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
                            <form.Field name="vendorId" validators={{ onChange: ({ value }) => !value ? "Vendor is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Vendor Name</Label>
                                        <Select
                                            value={field.state.value as string}
                                            onValueChange={(value) => field.handleChange(value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a vendor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    vendors.isLoading ? (
                                                        <SelectItem value="1">Loading...</SelectItem>
                                                    ) : vendors.error ? (
                                                        <SelectItem value="1">Error loading vendors</SelectItem>
                                                    ) : vendors.length === 0 ? (
                                                        <SelectItem value="-">No vendors found</SelectItem>
                                                    ) : vendors.map((vendor: Vendor) => (
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
                            <Button type="submit">{ mode === "edit" ? "Save Changes" : "Create"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}