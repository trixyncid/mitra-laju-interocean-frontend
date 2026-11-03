"use client"

import { ActiveStatusField } from "@/components/forms/active-status-field"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TextField } from "@/components/ui/text-field"
import { fieldError } from "@/lib/form-field"
import { serviceCodeSchema, serviceNameSchema } from "@/lib/schemas/service"
import { zodOnChange } from "@/lib/zod-form"
import { IconPlus } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"
import { useCreateService, useUpdateService } from "@/hooks/use-services"
import { useState } from "react"
import { Pencil } from "lucide-react"

export default function ServiceForm({
    mode,
    serviceCode,
    serviceName,
    isActive,
    id,
}: {
    mode: "edit" | "create",
    serviceCode: string | undefined,
    serviceName: string | undefined,
    isActive: boolean | undefined,
    id: string | undefined
}) {
    const [open, setOpen] = useState(false)

    const createService = useCreateService()
    const updateService = useUpdateService()
    const isPending = mode === "create" ? createService.isPending : updateService.isPending

    const form = useForm({
        defaultValues: {
            serviceCode: serviceCode ?? "",
            serviceName: serviceName ?? "",
            isActive: isActive ?? true,
        },
        onSubmit: async ({ value }) => {
            const onSuccess = () => {
                setOpen(false)
                form.reset()
            }
            const fields = {
                serviceCode: value.serviceCode.trim().toUpperCase(),
                serviceName: value.serviceName.trim(),
            }
            if (mode === "create") {
                createService.mutate(fields, { onSuccess })
            } else {
                updateService.mutate(
                    { id: id ?? "", service: { ...fields, isActive: value.isActive } },
                    { onSuccess }
                )
            }
        }
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mode === "edit" ? (
                    <Button variant="outline" size="icon" aria-label={`Edit ${serviceName}`}><Pencil /></Button>
                ) : (
                    <Button><IconPlus /> Add Service</Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === "edit" ? "Edit Service" : "Create New Service"}</DialogTitle>
                    <DialogDescription>
                        Services are booked to vendors on a shipment, for example trucking, freight or customs.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                >
                    <form.Field name="serviceName" validators={{ onChange: zodOnChange(serviceNameSchema) }}>
                        {(field) => (
                            <div className="my-3">
                                <TextField
                                    label="Service Name"
                                    required
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    placeholder="Customs clearance"
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    error={fieldError(field.state.meta.errors)}
                                />
                            </div>
                        )}
                    </form.Field>
                    <form.Field name="serviceCode" validators={{ onChange: zodOnChange(serviceCodeSchema) }}>
                        {(field) => (
                            <div className="my-3">
                                <TextField
                                    label="Code"
                                    required
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    placeholder="CUSTOMS"
                                    className="font-mono uppercase"
                                    onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                                    error={fieldError(field.state.meta.errors)}
                                />
                            </div>
                        )}
                    </form.Field>
                    {mode === "edit" ? (
                        <form.Field name="isActive">
                            {(field) => (
                                <div className="my-3">
                                    <ActiveStatusField
                                        id={field.name}
                                        value={field.state.value === true}
                                        onChange={(checked) => field.handleChange(checked)}
                                        description="Inactive services stay on old shipments but cannot be added to new ones."
                                    />
                                </div>
                            )}
                        </form.Field>
                    ) : null}
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {mode === "edit" ? (isPending ? "Updating..." : "Save Changes") : (isPending ? "Creating..." : "Create")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
