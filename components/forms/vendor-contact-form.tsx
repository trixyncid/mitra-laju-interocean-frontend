"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEdit, IconPlus } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"

export default function VendorContactForm({
    mode,
    contactName,
    phoneNumber,
    email
}: {
    mode: "edit" | "create",
    contactName: string | undefined,
    phoneNumber: string | undefined,
    email: string | undefined
}) {
    const form = useForm({
        defaultValues: {
            contactName: contactName ?? "",
            phoneNumber: phoneNumber ?? "",
            email: email ?? "",
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
                    <Button>{ mode === "edit" ? <IconEdit />: <><IconPlus /> Add Vendor Contact</>}</Button>
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
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Email is required" : undefined
                                }}
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
                        </div>
                        <DialogFooter>
                                <Button type="submit">{ mode === "edit" ? "Save Changes" : "Create"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}