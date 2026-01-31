"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEdit, IconPlus } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"

export default function VendorForm({
    mode,
    vendorName,
    vendorCode,
    npwp
}: {
    mode: "edit" | "create",
    vendorName: string | undefined,
    vendorCode: string | undefined,
    npwp: string | undefined
}) {
    const form = useForm({
        defaultValues: {
            vendorName: vendorName ?? "",
            vendorCode: vendorCode ?? "",
            npwp: npwp ?? "",
        },
        onSubmit: async ({ value }) => {
            console.log(value)
        }
    })

    return (
        <div>
            <Dialog onOpenChange={(open) => {
                if (!open) form.reset()
            }}>
                <DialogTrigger asChild>
                    <Button>{ mode === "edit" ? <IconEdit />: <><IconPlus /> Add Vendor</>}</Button>
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
                                            <em className="text-xs text-red-500">{field.state.meta.errors}</em>
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
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white">Delete</Button>
                            <Button type="submit">{ mode === "edit" ? "Save Changes" : "Create"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}