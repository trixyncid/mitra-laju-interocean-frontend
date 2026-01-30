"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEdit, IconPlus } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"

export default function PortForm({ mode, portName, country }: { mode: "edit" | "create", portName: string, country: string}) {
    const form = useForm({
        defaultValues: {
            portName: portName ?? "",
            country: country ?? ""
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
                        <Button>{ mode === "edit" ? <IconEdit /> : <><IconPlus /> Add Port</>}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{mode === "edit" ? "Edit Port": "Create Port"}</DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                form.handleSubmit()
                            }}
                        >
                            <div>
                                <form.Field
                                    name="portName"
                                    validators={{
                                        onChange: ({ value }) =>
                                            !value ? "Port Name is required" : undefined,
                                    }}
                                >
                                    {
                                        ( field ) => (
                                            <div className="my-3">
                                                <Label htmlFor={field.name} className="my-2">Port Name</Label>
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
                                        )
                                    }
                                </form.Field>
                                <form.Field
                                    name="country"
                                    validators={{
                                        onChange: (({ value }) =>
                                            !value ? "Country is required" : undefined
                                        )
                                    }}
                                >
                                    {
                                        (field) => (
                                            <div className="my-3">
                                                <Label htmlFor={field.name} className="my-2">Country</Label>
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
                                        )
                                    }
                                </form.Field>
                            </div>
                            <DialogFooter>
                                { mode === "edit" ? <Button variant="outline" className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white">Delete</Button> : <></>}
                                <Button type="submit">{ mode === "edit" ? "Save Changes" : "Create New Port"}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
            </Dialog>
        </div>
    )
}