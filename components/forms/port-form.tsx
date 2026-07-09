"use client"

import { CountryCombobox } from "@/components/country-combobox"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TextField } from "@/components/ui/text-field"
import { fieldError } from "@/lib/form-field"
import { portCountrySchema, portNameSchema } from "@/lib/schemas/port"
import { zodOnChange } from "@/lib/zod-form"
import { Switch } from "@/components/ui/switch"
import { IconPlus } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"
import { useCreatePort, useUpdatePort } from "@/hooks/use-ports"
import { useState } from "react"
import { Pencil } from "lucide-react"

export default function PortForm({
    mode,
    portName,
    portCountry,
    isActive,
    id,
}: {
    mode: "edit" | "create",
    portName: string | undefined,
    portCountry: string | undefined,
    isActive: boolean | undefined,
    id: string | undefined
}) {
    const [open, setOpen] = useState(false)

    const createPort = useCreatePort()
    const updatePort = useUpdatePort()

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            portName: portName ?? "",
            portCountry: portCountry ?? "",
            isActive: isActive ?? true,
        },
        onSubmit: async ({ value }) => {
            if (mode === "create") {
                createPort.mutate({
                    portName: value.portName,
                    portCountry: value.portCountry,
                    isActive: value.isActive,
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    }
                })
            } else {
                const portId = value.id

                updatePort.mutate({
                    id: portId,
                    port: {
                        id: value.id,
                        portName: value.portName,
                        portCountry: value.portCountry,
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
            <Dialog open={open} onOpenChange={setOpen} modal={false}>
                <DialogTrigger asChild>
                    { mode === "edit" ? <Button variant="outline" size="icon"><Pencil /></Button> : <Button><IconPlus /> Add Port</Button>}
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
                                    onChange: zodOnChange(portNameSchema),
                                }}
                            >
                                {
                                    ( field ) => (
                                        <div className="my-3">
                                            <TextField
                                                label="Port Name"
                                                required
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                error={fieldError(field.state.meta.errors)}
                                            />
                                        </div>
                                    )
                                }
                            </form.Field>
                            <form.Field
                                name="portCountry"
                                validators={{
                                    onChange: zodOnChange(portCountrySchema),
                                }}
                            >
                                {
                                    (field) => (
                                        <div className="my-3">
                                            <CountryCombobox
                                                id={field.name}
                                                value={field.state.value}
                                                onValueChange={(nextValue) => field.handleChange(nextValue)}
                                                error={fieldError(field.state.meta.errors)}
                                                required
                                                placeholder="Search country..."
                                            />
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
                            <Button type="submit" disabled={ mode === "create" ? createPort.isPending : false || mode === "edit" ? updatePort.isPending : false}>{ mode === "edit" ? (updatePort.isPending ? "Updating..." : "Save Changes") : (createPort.isPending ? "Creating..." : "Create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}