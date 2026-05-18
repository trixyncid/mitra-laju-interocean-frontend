"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useCreateVendor, useUpdateVendor } from "@/hooks/use-vendors"
import { IconPlus } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"
import { Pencil } from "lucide-react"
import { useState } from "react"

export default function VendorForm({
    id,
    mode,
    vendorName,
    vendorCode,
    npwp,
    isActive
}: {
    mode: "edit" | "create",
    id: string | undefined,
    vendorName: string | undefined,
    vendorCode: string | undefined,
    npwp: string | undefined,
    isActive: boolean | undefined
}) {
    const [open, setOpen] = useState(false)

    const createVendor = useCreateVendor()
    const updateVendor = useUpdateVendor()

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            vendorName: vendorName ?? "",
            vendorCode: vendorCode ?? "",
            npwp: npwp ?? "",
            isActive: isActive ?? true,
        },
        onSubmit: async ({ value }) => {
            if (mode === "create") {
                createVendor.mutate({
                    vendorName: value.vendorName,
                    vendorCode: value.vendorCode,
                    npwp: value.npwp,
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    }
                })
            } else {
                updateVendor.mutate({ id: id ?? "", vendor: {
                    vendorName: value.vendorName,
                    vendorCode: value.vendorCode,
                    npwp: value.npwp,
                    isActive: value.isActive,
                } }, {
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
                    { mode === "edit" ? <Button variant="outline" size="icon"><Pencil /></Button> : <Button><IconPlus /> Add Vendor</Button>}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ mode === "edit" ? "Edit Vendor" : "Create New Vendor"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            <form.Field
                                name="vendorCode"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Vendor Code is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Vendor Code</Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                        {field.state.meta.errors ? (
                                            <em className="text-xs text-[var(--mli-on-error-container)]">{field.state.meta.errors}</em>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="vendorName"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Vendor Name is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Vendor Name</Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                        {field.state.meta.errors ? (
                                            <em className="text-xs text-[var(--mli-on-error-container)]">{field.state.meta.errors}</em>
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
                            <Button type="submit" disabled={ mode === "create" ? createVendor.isPending : false || mode === "edit" ? updateVendor.isPending : false}>{ mode === "edit" ? (updateVendor.isPending ? "Updating..." : "Save Changes") : (createVendor.isPending ? "Creating..." : "Create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}