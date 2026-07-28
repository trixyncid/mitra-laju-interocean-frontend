"use client"

import { Button } from "@/components/ui/button"
import { DeleteConfirmButton } from "@/components/ui/delete-confirm-button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CountryCombobox } from "@/components/country-combobox"
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
import { useEffect, useState } from "react"

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
    shipperId,
    trigger,
    hideDeleteTrigger = false,
    open: openProp,
    onOpenChange,
    deleteOpen: deleteOpenProp,
    onDeleteOpenChange,
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
    trigger?: React.ReactNode
    hideDeleteTrigger?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
    deleteOpen?: boolean
    onDeleteOpenChange?: (open: boolean) => void
 }) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const [uncontrolledDeleteOpen, setUncontrolledDeleteOpen] = useState(false)

    const open = openProp ?? uncontrolledOpen
    const setOpen = onOpenChange ?? setUncontrolledOpen
    const deleteOpen = deleteOpenProp ?? uncontrolledDeleteOpen
    const setDeleteOpen = onDeleteOpenChange ?? setUncontrolledDeleteOpen

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

    useEffect(() => {
        if (!open) return
        form.reset({
            id: id ?? "",
            customerId,
            shipperId,
            addressLine1: addressLine1 ?? "",
            addressLine2: addressLine2 ?? "",
            addressLine3: addressLine3 ?? "",
            city: city ?? "",
            province: province ?? "",
            country: country ?? "",
            postalCode: postalCode ?? "",
        })
        // form API is stable; reset when the dialog opens or entity values change
        // eslint-disable-next-line react-hooks/exhaustive-deps -- form.reset
    }, [
        open,
        id,
        customerId,
        shipperId,
        addressLine1,
        addressLine2,
        addressLine3,
        city,
        province,
        country,
        postalCode,
    ])

  const defaultTrigger =
    mode === "edit" ? (
      <Button variant="outline" size="sm">Edit</Button>
    ) : (
      <Button variant="outline" size="sm"><IconPlus /> Location</Button>
    )

  return (
    <div className="flex flex-row items-center gap-x-2">
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger === null ? null : (
              <DialogTrigger asChild>
                {trigger ?? defaultTrigger}
              </DialogTrigger>
            )}
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
                            name="province"
                            validators={{
                                onChange: zodOnChange(provinceSchema),
                            }}
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <TextField
                                        label="Province / State"
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
                            name="country"
                            validators={{
                                onChange: zodOnChange(locationCountrySchema),
                            }}
                        >
                            {( field ) => (
                                <div className="my-3">
                                    <CountryCombobox
                                        id={field.name}
                                        value={field.state.value}
                                        onValueChange={(nextValue) => field.handleChange(nextValue)}
                                        error={fieldError(field.state.meta.errors)}
                                        required
                                        placeholder="Search country..."
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
            mode === "create" ? null :
            <Dialog open={deleteOpen} onOpenChange={(next) => { if (deleteCustomerLocation.isPending) return; setDeleteOpen(next) }}>
                {hideDeleteTrigger ? null : (
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon-sm" aria-label="Delete location"><IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" /></Button>
                    </DialogTrigger>
                )}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Location</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you sure you want to delete this location? This action cannot be undone and all contacts will be deleted as well.
                    </DialogDescription>
                    <DialogFooter>
                        <DeleteConfirmButton
                            isPending={deleteCustomerLocation.isPending}
                            onClick={() => {
                                deleteCustomerLocation.mutate({ customerId: customerId, shipperId: shipperId, locationId: id ?? "" }, {
                                    onSuccess: () => {
                                        setDeleteOpen(false)
                                        form.reset()
                                    }
                                })
                            }}
                        />
                        <DialogClose asChild>
                            <Button variant="secondary" disabled={deleteCustomerLocation.isPending}>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog> 
        }
    </div>
  )
}