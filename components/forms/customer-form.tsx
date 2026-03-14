"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers"
import { IconPlus } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"
import { Pencil } from "lucide-react"
import { useState } from "react"

export default function CustomerForm({
    mode,
    id,
    customerName,
    customerCode,
    npwp,
    isActive
}: {
    mode: "edit" | "create"
    id: string | undefined,
    customerName: string | undefined,
    customerCode: string | undefined,
    npwp: string | undefined,
    isActive: boolean | undefined
}) {
    const [open, setOpen] = useState(false)

    const createCustomer = useCreateCustomer()
    const updateCustomer = useUpdateCustomer()

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            customerName: customerName ?? "",
            customerCode: customerCode ?? "",
            npwp: npwp ?? "",
            isActive: isActive ?? true,
        },
        onSubmit: async ({ value }) => {
            if (mode === "create") {
                createCustomer.mutate({
                    customerName: value.customerName,
                    customerCode: value.customerCode,
                    npwp: value.npwp,
                    isActive: value.isActive,
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    }
                })
            } else {
                updateCustomer.mutate({
                    id: value.id,
                    customer: {
                        customerName: value.customerName,
                        customerCode: value.customerCode,
                        npwp: value.npwp,
                        isActive: value.isActive,
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
                    { mode === "edit" ? <Button variant="outline" size="icon"><Pencil /></Button> : <Button><IconPlus /> Add Customer</Button>}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ mode === "edit" ? "Edit Customer" : "Create New Customer"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            <form.Field
                                name="customerCode"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Customer Code is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Customer Code</Label>
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
                                name="customerName"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Customer Name is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Customer Name</Label>
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
                                name="npwp"
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">NPWP</Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
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
                            <Button type="submit" disabled={ mode === "create" ? createCustomer.isPending : false || mode === "edit" ? updateCustomer.isPending : false}>{ mode === "edit" ? (updateCustomer.isPending ? "Updating..." : "Save Changes") : (createCustomer.isPending ? "Creating..." : "Create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}