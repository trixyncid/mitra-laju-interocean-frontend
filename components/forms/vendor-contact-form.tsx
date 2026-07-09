"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TextField } from "@/components/ui/text-field"
import { fieldError } from "@/lib/form-field"
import { contactNameSchema, phoneNumberSchema } from "@/lib/schemas/contact"
import { zodOnChange } from "@/lib/zod-form"
import { Switch } from "@/components/ui/switch"
import { useCreateVendorContact, useDeleteVendorContact, useUpdateVendorContact } from "@/hooks/use-vendors"
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"
import { toast } from "sonner"

export default function VendorContactForm({
    id,
    mode,
    contactName,
    phoneNumber,
    email,
    isActive,
    vendorId,
    locationId
}: {
    id?: string
    mode: "edit" | "create",
    contactName: string | undefined,
    phoneNumber: string | undefined,
    email: string | undefined,
    isActive: boolean | undefined
    vendorId: string,
    locationId: string
}) {
    const [ open, setOpen ] = useState(false)
    const [ deleteOpen, setDeleteOpen ] = useState(false)

    const createVendorContact = useCreateVendorContact(vendorId)
    const updateVendorContact = useUpdateVendorContact(vendorId)
    const deleteVendorContact = useDeleteVendorContact(vendorId)

    const form = useForm({
        defaultValues: {
            contactName: contactName ?? "",
            phoneNumber: phoneNumber ?? "",
            email: email ?? "",
            isActive: isActive ?? true,
        },
        onSubmit: async ({ value }) => {
            if (mode === "create") {
                createVendorContact.mutate({
                    vendorId: vendorId,
                    locationId: locationId,
                    contact: {
                        contactName: value.contactName,
                        phoneNumber: value.phoneNumber,
                        email: value.email,
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
                updateVendorContact.mutate({
                    vendorId: vendorId,
                    locationId: locationId,
                    contactId: id ?? "",
                    contact: {
                        contactName: value.contactName,
                        phoneNumber: value.phoneNumber,
                        email: value.email,
                        isActive: value.isActive,
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

    return (
        <div className="flex flex-row items-center gap-x-2">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    { mode === "edit" ? <Button variant="outline" size="icon"><IconPencil /></Button> : <Button variant="outline" size="sm"><IconPlus /> Contact</Button>}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ mode === "edit" ? "Edit Vendor Contact" : "Add New Vendor Contact"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            <form.Field
                                name="contactName"
                                validators={{
                                    onChange: zodOnChange(contactNameSchema),
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Contact Name"
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
                                name="phoneNumber"
                                validators={{
                                    onChange: zodOnChange(phoneNumberSchema),
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Phone Number"
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
                                name="email"
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Email"
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            { mode === "edit" ? <form.Field
                                name="isActive"
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Switch id={field.name} checked={field.state.value === true} onCheckedChange={(checked) => field.handleChange(checked)} />
                                        <Label htmlFor={field.name} className="my-2">Is Active</Label>
                                    </div>
                                )}
                            </form.Field> : null}
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={ mode === "create" ? createVendorContact.isPending : false || mode === "edit" ? updateVendorContact.isPending : false}>{ mode === "edit" ? (updateVendorContact.isPending ? "Updating..." : "Save Changes") : (createVendorContact.isPending ? "Creating..." : "Create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {
                mode === "create" ? <></>
                :
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon"><IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Vendor Contact</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this vendor contact? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="destructive" onClick={() => {
                                deleteVendorContact.mutate({ vendorId: vendorId, locationId: locationId, contactId: id ?? "" }, {
                                    onSuccess: () => {
                                        setDeleteOpen(false)
                                    },
                                    onError: (error) => {
                                        toast.error(error.message)
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