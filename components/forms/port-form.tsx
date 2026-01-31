"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { IconEdit, IconPlus } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"

export default function PortForm({
    mode,
    portName,
    country,
    isActive
}: {
    mode: "edit" | "create",
    portName: string | undefined,
    country: string | undefined,
    isActive: boolean | undefined
}) {
    const form = useForm({
        defaultValues: {
            portName: portName ?? "",
            country: country ?? "",
            isActive: isActive ?? true,
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
                            <DialogTitle>{mode === "edit" ? "Edit Port": "Create New Port"}</DialogTitle>
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
            </div>
        );
}