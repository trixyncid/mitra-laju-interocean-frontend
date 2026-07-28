"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import { DeleteConfirmButton } from "../ui/delete-confirm-button"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { CountryCombobox } from "@/components/country-combobox"
import { ActiveStatusField } from "@/components/forms/active-status-field"
import { TextField } from "../ui/text-field"
import { useForm } from "@tanstack/react-form"
import { fieldError } from "@/lib/form-field"
import {
  shipperNameSchema,
} from "@/lib/schemas/shipper"
import { zodOnChange } from "@/lib/zod-form"
import { useCreateCustomerShipper, useDeleteCustomerShipper, useUpdateCustomerShipper } from "@/hooks/use-customers"

export default function CustomerShipperForm({
    mode,
    id,
    name,
    phoneNumber,
    country,
    isActive,
    customerId,
    trigger,
    hideDeleteTrigger = false,
    open: openProp,
    onOpenChange,
    deleteOpen: deleteOpenProp,
    onDeleteOpenChange,
}: {
    mode: "edit" | "create",
    id: string | undefined,
    name: string | undefined,
    phoneNumber: string | undefined,
    country: string | undefined,
    isActive: boolean | undefined
    customerId: string
    trigger?: React.ReactNode
    hideDeleteTrigger?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
    deleteOpen?: boolean
    onDeleteOpenChange?: (open: boolean) => void
}) {
    const [ uncontrolledOpen, setUncontrolledOpen ] = useState(false)
    const [ uncontrolledDeleteOpen, setUncontrolledDeleteOpen ] = useState(false)

    const open = openProp ?? uncontrolledOpen
    const setOpen = onOpenChange ?? setUncontrolledOpen
    const deleteOpen = deleteOpenProp ?? uncontrolledDeleteOpen
    const setDeleteOpen = onDeleteOpenChange ?? setUncontrolledDeleteOpen

    const createShipper = useCreateCustomerShipper()
    const updateShipper = useUpdateCustomerShipper()
    const deleteShipper = useDeleteCustomerShipper()

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            name: name ?? "",
            phoneNumber: phoneNumber ?? "",
            country: country ?? "",
            isActive: isActive ?? true,
        },
        onSubmit: async ({ value }) => {
            const shipper = {
                name: value.name,
                phoneNumber: value.phoneNumber.trim() === "" ? null : value.phoneNumber,
                country: value.country.trim() === "" ? null : value.country,
                isActive: value.isActive,
            }

            if (mode === "create") {
                createShipper.mutate({ customerId, shipper }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    }
                })
            } else {
                updateShipper.mutate({ customerId, shipperId: id ?? "", shipper }, {
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
            name: name ?? "",
            phoneNumber: phoneNumber ?? "",
            country: country ?? "",
            isActive: isActive ?? true,
        })
        // form API is stable; reset when the dialog opens or entity values change
        // eslint-disable-next-line react-hooks/exhaustive-deps -- form.reset
    }, [open, id, name, phoneNumber, country, isActive])

    const defaultTrigger =
        mode === "edit" ? (
            <Button variant="outline" size="sm">Edit</Button>
        ) : (
            <Button variant="outline" size="sm"><IconPlus /> Shipper</Button>
        )

    return (
        <div className="flex flex-row items-center gap-x-2">
            {/* Create/Edit Shipper Dialog */}
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
                        <DialogTitle>{ mode === "edit" ? "Edit Shipper" : "Create New Shipper"}</DialogTitle>
                        <DialogDescription>
                            {mode === "edit"
                                ? "Update shipper details for this customer."
                                : "Add a new shipper for this customer."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            <form.Field name="name" validators={{ onChange: zodOnChange(shipperNameSchema) }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Name"
                                            required
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value ?? ""}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="phoneNumber">
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Phone Number"
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value ?? ""}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            error={fieldError(field.state.meta.errors)}
                                            description="Optional contact number."
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="country">
                                {( field ) => (
                                    <div className="my-3">
                                        <CountryCombobox
                                            id={field.name}
                                            value={field.state.value ?? ""}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            error={fieldError(field.state.meta.errors)}
                                            description="Optional shipper country or region."
                                            placeholder="Search country..."
                                        />
                                    </div>
                                )}
                            </form.Field>
                            {
                                mode === "edit" ? <form.Field name="isActive">
                                    {( field ) => (
                                        <div className="my-3">
                                            <ActiveStatusField
                                                id={field.name}
                                                value={field.state.value === true}
                                                onChange={(checked) => field.handleChange(checked)}
                                                description="Inactive shippers stay in history but are hidden when creating new shipments."
                                            />
                                        </div>
                                    )}
                                </form.Field> : null
                            }   
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={ mode === "create" ? createShipper.isPending : false || mode === "edit" ? updateShipper.isPending : false}>{ mode === "edit" ? (updateShipper.isPending ? "Updating..." : "Save Changes") : (createShipper.isPending ? "Creating..." : "Create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            
            {/* Delete Shipper Dialog */}
            {
                mode === "create" ? null
                :
                <Dialog open={deleteOpen} onOpenChange={(next) => { if (deleteShipper.isPending) return; setDeleteOpen(next) }}>
                    {hideDeleteTrigger ? null : (
                        <DialogTrigger asChild>
                                <Button variant="outline" size="icon-sm" aria-label="Delete shipper"><IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" /></Button>
                        </DialogTrigger>
                    )}
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Shipper</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                            Are you sure you want to delete this shipper? It will remove all locations and contacts associated with this shipper. This action cannot be undone.
                        </DialogDescription>
                        <DialogFooter>
                            <DeleteConfirmButton
                                isPending={deleteShipper.isPending}
                                onClick={() => {
                                    deleteShipper.mutate({ customerId, shipperId: id ?? "" }, {
                                        onSuccess: () => {
                                            setDeleteOpen(false)
                                        }
                                    })
                                }}
                            />
                            <DialogClose asChild>
                                <Button variant="secondary" disabled={deleteShipper.isPending}>Cancel</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            }
        </div>
    )
}