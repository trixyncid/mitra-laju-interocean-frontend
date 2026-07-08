"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TextField } from "@/components/ui/text-field"
import { fieldError } from "@/lib/form-field"
import {
  addressLine1Schema,
  citySchema,
  locationCountrySchema,
  provinceSchema,
} from "@/lib/schemas/location"
import { zodOnChange } from "@/lib/zod-form"
import { useCreateCustomerLocation, useUpdateCustomerLocation, useDeleteCustomerLocation } from "@/hooks/use-customers"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"

export default function CustomerLocationForm({ 
    mode,
    id,
    addressLine1,
    addressLine2,
    addressLine3,
    city,
    province,
    country,
    postalCode,
    customerId,
    shipperId
 }: {
    mode: "edit" | "create",
    id: string | undefined,
    customerId: string,
    shipperId: string,
    addressLine1: string | undefined,
    addressLine2: string | undefined,
    addressLine3: string | undefined,
    city: string | undefined,
    province: string | undefined,
    country: string | undefined,
    postalCode: string | undefined
 }) {
    const [open, setOpen] = useState(false)
    const [ deleteOpen, setDeleteOpen ] = useState(false)

    const deleteCustomerLocation = useDeleteCustomerLocation(customerId)
    const createCustomerLocation = useCreateCustomerLocation(customerId)
    const updateCustomerLocation = useUpdateCustomerLocation(customerId)

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            customerId: customerId,
            shipperId: shipperId,
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
                createCustomerLocation.mutate({
                    customerId: customerId,
                    shipperId: shipperId,
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
            } else {
                updateCustomerLocation.mutate({
                    customerId: customerId,
                    shipperId: shipperId,
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
    <div className="flex flex-row items-center gap-x-2">
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                { mode === "edit" ? <Button variant="outline" size="sm">Edit</Button>: <Button variant="outline" size="sm"><IconPlus /> Location</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{ mode === "edit" ? "Edit Location" : "Create New Location"}</DialogTitle>
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
                                onChange: zodOnChange(addressLine1Schema),
                            }}
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <TextField
                                        label="Address Line 1"
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
                            name="addressLine2"
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <TextField
                                        label="Address Line 2"
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
                                    <TextField
                                        label="Address Line 3"
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
                                onChange: zodOnChange(citySchema),
                            }}
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <TextField
                                        label="City"
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
                            name="province"
                            validators={{
                                onChange: zodOnChange(provinceSchema),
                            }}
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <TextField
                                        label="Province / State"
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
                            name="country"
                            validators={{
                                onChange: zodOnChange(locationCountrySchema),
                            }}
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <TextField
                                        label="Country"
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
                            name="postalCode"
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <TextField
                                        label="Postal Code"
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
                        <Button type="submit" disabled={ mode === "create" ? createCustomerLocation.isPending : false || mode === "edit" ? updateCustomerLocation.isPending : false}>{ mode === "edit" ? (updateCustomerLocation.isPending ? "Updating..." : "Save Changes") : (createCustomerLocation.isPending ? "Creating..." : "Create")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {
            mode === "create" ? <></> :
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon"><IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Location</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you sure you want to delete this location? This action cannot be undone and all contacts will be deleted as well.
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => {
                            deleteCustomerLocation.mutate({ customerId: customerId, shipperId: shipperId, locationId: id ?? "" }, {
                                onSuccess: () => {
                                    setDeleteOpen(false)
                                    form.reset()
                                }
                            })
                        }}>Delete</Button>
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog> 
        }
    </div>
  )
}