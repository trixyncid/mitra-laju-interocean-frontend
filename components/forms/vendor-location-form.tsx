"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateVendorLocation, useDeleteVendorLocation, useUpdateVendorLocation } from "@/hooks/use-vendors"
import { IconPlus } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"
import { toast } from "sonner"

export default function VendorLocationForm({ 
    mode,
    id,
    addressLine1,
    addressLine2,
    addressLine3,
    city,
    province,
    country,
    postalCode,
    vendorId
 }: {
    mode: "edit" | "create",
    id: string | undefined,
    addressLine1: string | undefined,
    addressLine2: string | undefined,
    addressLine3: string | undefined,
    city: string | undefined,
    province: string | undefined,
    country: string | undefined,
    postalCode: string | undefined
    vendorId: string
 }) {
    const [ open, setOpen ] = useState(false)

    const createVendorLocation = useCreateVendorLocation(vendorId)
    const updateVendorLocation = useUpdateVendorLocation(vendorId)
    const deleteVendorLocation = useDeleteVendorLocation(vendorId)

    const form = useForm({
        defaultValues: {
            addressLine1: addressLine1 ?? "",
            addressLine2: addressLine2 ?? "",
            addressLine3: addressLine3 ?? "",
            city: city ?? "",
            province: province ?? "",
            country: country ?? "",
            postalCode: postalCode ?? ""
        },
        onSubmit: async ({ value }) => {
            if (mode === "create") {
                createVendorLocation.mutate({
                    vendorId: vendorId,
                    location: {
                        addressLine1: value.addressLine1,
                        addressLine2: value.addressLine2,
                        addressLine3: value.addressLine3,
                        city: value.city,
                        province: value.province,
                        country: value.country,
                        postalCode: value.postalCode
                    }
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    },
                    onError: (error) => {
                        toast.error(error.message)
                    }
                })
            } else {
                updateVendorLocation.mutate({
                    vendorId: vendorId,
                    locationId: id ?? "",
                    location: {
                        addressLine1: value.addressLine1,
                        addressLine2: value.addressLine2,
                        addressLine3: value.addressLine3,
                        city: value.city,
                        province: value.province,
                        country: value.country,
                        postalCode: value.postalCode
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

  return (
    <div>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                { mode === "edit" ? <Button variant="outline" size="sm">Edit</Button> : <Button variant="outline" size="sm"><IconPlus /> Add Office</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{ mode === "edit" ? "Edit Vendor Location" : "Create New Vendor Location"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                }}>
                    <div>
                        <form.Field
                            name="addressLine1"
                            validators={{
                                onChange: ({ value }) =>
                                    !value ? "Address Line 1 is required" : undefined
                            }}
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <Label htmlFor={field.name} className="my-2">Address Line 1</Label>
                                    <Input 
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors ? (
                                        <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                    ) : null}
                                </div>
                            )}
                        </form.Field>
                        <form.Field
                            name="addressLine2"
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <Label htmlFor={field.name} className="my-2">Address Line 2</Label>
                                    <Input 
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        </form.Field>
                        <form.Field
                            name="addressLine3"
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <Label htmlFor={field.name} className="my-2">Address Line 3</Label>
                                    <Input 
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        </form.Field>
                        <form.Field
                            name="city"
                            validators={{
                                onChange: ({ value }) =>
                                    !value ? "City is required" : undefined
                            }}
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <Label htmlFor={field.name} className="my-2">City</Label>
                                    <Input 
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors ? (
                                        <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                    ) : null}
                                </div>
                            )}
                        </form.Field>
                        <form.Field
                            name="province"
                            validators={{
                                onChange: ({ value }) =>
                                    !value ? "Province is required" : undefined
                            }}
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <Label htmlFor={field.name} className="my-2">Province / State</Label>
                                    <Input 
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors ? (
                                        <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                    ) : null}
                                </div>
                            )}
                        </form.Field>
                        <form.Field
                            name="country"
                            validators={{
                                onChange: ({ value }) =>
                                    !value ? "Country is required" : undefined
                            }}
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <Label htmlFor={field.name} className="my-2">Country</Label>
                                    <Input 
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors ? (
                                        <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                    ) : null}
                                </div>
                            )}
                        </form.Field>
                        <form.Field
                            name="postalCode"
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <Label htmlFor={field.name} className="my-2">Postal Code</Label>
                                    <Input 
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>
                    <DialogFooter>
                    <Button type="submit" disabled={ mode === "create" ? createVendorLocation.isPending : false || mode === "edit" ? updateVendorLocation.isPending : false}>{ mode === "edit" ? (updateVendorLocation.isPending ? "Updating..." : "Save Changes") : (createVendorLocation.isPending ? "Creating..." : "Create")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
  )
}