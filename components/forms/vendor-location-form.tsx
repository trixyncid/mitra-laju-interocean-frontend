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
import { useCreateVendorLocation, useDeleteVendorLocation, useUpdateVendorLocation } from "@/hooks/use-vendors"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"
import { useEffect, useState } from "react"
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
    vendorId,
    trigger,
    hideDeleteTrigger = false,
    open: openProp,
    onOpenChange,
    deleteOpen: deleteOpenProp,
    onDeleteOpenChange,
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
                    },
                    onError: (error) => {
                        toast.error(error.message)
                    }
                })
            }
        }
    })

    useEffect(() => {
        if (!open) return
        form.reset({
            addressLine1: addressLine1 ?? "",
            addressLine2: addressLine2 ?? "",
            addressLine3: addressLine3 ?? "",
            city: city ?? "",
            province: province ?? "",
            country: country ?? "",
            postalCode: postalCode ?? "",
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps -- form.reset
    }, [
        open,
        id,
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
      <Button variant="outline" size="sm"><IconPlus /> Add Office</Button>
    )

  return (
    <div className="flex flex-row items-center gap-x-2">
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger === null ? null : (
              <DialogTrigger asChild>
                {trigger ?? defaultTrigger}
              </DialogTrigger>
            )}
            <DialogContent
                onInteractOutside={(e) => {
                    const target = e.target as Element
                    if (target.closest('[data-slot="combobox-content"]')) {
                        e.preventDefault()
                    }
                }}
            >
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
                    <Button type="submit" disabled={ mode === "create" ? createVendorLocation.isPending : false || mode === "edit" ? updateVendorLocation.isPending : false}>{ mode === "edit" ? (updateVendorLocation.isPending ? "Updating..." : "Save Changes") : (createVendorLocation.isPending ? "Creating..." : "Create")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {
            mode === "create" ? null
            :
            <Dialog open={deleteOpen} onOpenChange={(next) => { if (deleteVendorLocation.isPending) return; setDeleteOpen(next) }}>
                {hideDeleteTrigger ? null : (
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon"><IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" /></Button>
                    </DialogTrigger>
                )}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Vendor Location</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this vendor location? This action cannot be undone and all associated contacts will also be deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DeleteConfirmButton
                            isPending={deleteVendorLocation.isPending}
                            onClick={() => {
                                deleteVendorLocation.mutate({ vendorId: vendorId, locationId: id ?? "" }, {
                                    onSuccess: () => {
                                        setDeleteOpen(false)
                                    },
                                    onError: (error) => {
                                        toast.error(error.message)
                                    }
                                })
                            }}
                        />
                        <DialogClose asChild>
                            <Button variant="secondary" disabled={deleteVendorLocation.isPending}>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        }
    </div>
  )
}
