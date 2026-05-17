"use client"

import { useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { Input } from "../ui/input"
import { useForm } from "@tanstack/react-form"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"
import { useCreateCustomerShipper, useDeleteCustomerShipper, useUpdateCustomerShipper } from "@/hooks/use-customers"

export default function CustomerShipperForm({
    mode,
    id,
    name,
    phoneNumber,
    country,
    isActive,
    customerId
}: {
    mode: "edit" | "create",
    id: string | undefined,
    name: string | undefined,
    phoneNumber: string | undefined,
    country: string | undefined,
    isActive: boolean | undefined
    customerId: string
}) {
    const [ open, setOpen ] = useState(false)
    const [ deleteOpen, setDeleteOpen ] = useState(false)

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
            if (mode === "create") {
                createShipper.mutate({ customerId, shipper: { name: value.name, phoneNumber: value.phoneNumber, country: value.country, isActive: value.isActive } }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    }
                })
            } else {
                updateShipper.mutate({ customerId, shipperId: id ?? "", shipper: { name: value.name, phoneNumber: value.phoneNumber, country: value.country, isActive: value.isActive } }, {
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
            {/* Create/Edit Shipper Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    { mode === "edit" ? <Button variant="outline" size="sm">Edit</Button>: <Button variant="outline" size="sm"><IconPlus /> Shipper</Button>}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ mode === "edit" ? "Edit Shipper" : "Create New Shipper"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            <form.Field name="name" validators={{ onChange: ({ value }) => !value ? "Name is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Name</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value ?? ""} onChange={(e) => field.handleChange(e.target.value)} />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="phoneNumber" validators={{ onChange: ({ value }) => !value ? "Phone Number is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Phone Number</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value ?? ""} onChange={(e) => field.handleChange(e.target.value)} />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="country" validators={{ onChange: ({ value }) => !value ? "Country is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Country</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value ?? ""} onChange={(e) => field.handleChange(e.target.value)} />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            {
                                mode === "edit" ? <form.Field name="isActive">
                                    {( field ) => (
                                        <div className="my-3">
                                            <Switch id={field.name} checked={field.state.value === true} onCheckedChange={(checked) => field.handleChange(checked)} />
                                            <Label htmlFor={field.name} className="my-2">Is Active</Label>
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
                mode === "create" ? <></> 
                :
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon"><IconTrash className="text-red-500 hover:bg-red-50" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Shipper</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                            Are you sure you want to delete this shipper? It will remove all locations and contacts associated with this shipper. This action cannot be undone.
                        </DialogDescription>
                        <DialogFooter>
                            <Button variant="destructive" onClick={() => {
                                deleteShipper.mutate({ customerId, shipperId: id ?? "" }, {
                                    onSuccess: () => {
                                        setDeleteOpen(false)
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