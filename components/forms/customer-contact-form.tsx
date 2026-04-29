"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useCreateCustomerContact, useUpdateCustomerContact, useDeleteCustomerContact } from "@/hooks/use-customers"
import { IconPlus, IconTrash, IconPencil } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"

export default function CustomerContactForm({
    mode,
    id,
    contactName,
    customerId,
    shipperId,
    phoneNumber,
    email,
    isActive,
    locationId
}: {
    id?: string
    mode: "edit" | "create",
    contactName: string | undefined,
    customerId: string,
    shipperId: string,
    phoneNumber: string | undefined,
    email: string | undefined
    isActive: boolean | undefined
    locationId: string
}) {
    const [open, setOpen] = useState(false)
    const [ deleteOpen, setDeleteOpen ] = useState(false)

    const createCustomerContact = useCreateCustomerContact(customerId, shipperId, locationId)
    const updateCustomerContact = useUpdateCustomerContact(customerId, shipperId, locationId)
    const deleteCustomerContact = useDeleteCustomerContact(customerId, shipperId, locationId)

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            locationId: locationId,
            contactName: contactName ?? "",
            phoneNumber: phoneNumber ?? "",
            email: email ?? "",
            isActive: isActive ?? true,
        },
        onSubmit: async ({ value }) => {
            if (mode === "create") {
                createCustomerContact.mutate({ contact: value }, {
                    onSuccess: () => {
                        form.reset()
                        setOpen(false)
                    }
                })
            } else {
                updateCustomerContact.mutate({ contactId: id ?? "", contact: value }, {
                    onSuccess: () => {
                        form.reset()
                        setOpen(false)
                    }
                })
            }
        }
    })

    return (
        <div className="flex flex-row items-center gap-x-2">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    { mode === "edit" ? <Button variant="outline" size="sm"><IconPencil /></Button>: <Button variant="outline" size="sm"><IconPlus /> Contact</Button>}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ mode === "edit" ? "Edit Contact" : "Add New Contact"}</DialogTitle>
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
                                    onChange: ({ value }) =>
                                        !value ? "Contact Name is required" : undefined
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Contact Name</Label>
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
                                name="phoneNumber"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Phone Number is required" : undefined
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Phone Number</Label>
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
                                name="email"
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Email</Label>
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
                            <Button type="submit">{ mode === "edit" ? "Save Changes" : "Create"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {
                mode === "create" ? <></> : 
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon"><IconTrash className="text-red-500 hover:bg-red-50" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Contact</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                            Are you sure you want to delete this contact? This action cannot be undone.
                        </DialogDescription>
                        <DialogFooter>
                            <Button variant="destructive" onClick={() => {
                                deleteCustomerContact.mutate({ contactId: id ?? "" }, {
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